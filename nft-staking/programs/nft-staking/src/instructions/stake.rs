use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        mpl_token_metadata::instructions::{
            FreezeDelegatedAccountCpi,
            FreezeDelegatedAccountCpiAccounts
        },
        MasterEditionAccount,
        Metadata,  // from metaplex
        MetadataAccount // from metaplex
    },
    token::{
        approve,
        Approve,
        Mint,
        Token,
        TokenAccount
    }
};

use crate::{error::StakeError, state::{StakeAccount, StakeConfig, UserAccount}};

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub mint: Account<'info, Mint>,
    pub collection_mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub mint_ata: Account<'info, TokenAccount>, // nft needs to live in this ata, witch have user authority
    #[account(
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(), // defined in the end of the method
            mint.key().as_ref()
        ],
        seeds::program = metadata_program.key(), // not a pda owned by the program, but by the metadata program
        bump,
        constraint = metadata.collection.as_ref().unwrap().key.as_ref() == collection_mint.key().as_ref(), // to check if our collection matches the metadata collection
        constraint = metadata.collection.as_ref().unwrap().verified == true, // to check if the nft is verified as part of the collection
    )]
    pub metadata: Account<'info, MetadataAccount>, // MetadataAccount is a PDA owned by metadata program, the seeds for it is "metadata", the program and the mint
    #[account(
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            b"master_edition"
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    pub master_edition: Account<'info, MasterEditionAccount>, // will verify that the current supply is 1, 0 decimals and pass the mint authority to itself
    #[account( // proves the be non fungible
        seeds = [b"config".as_ref()],
        bump = config_account.bump,
    )]
    pub config_account: Account<'info, StakeConfig>,
    #[account(
        init,
        payer = user,
        space = 8 + StakeAccount::INIT_SPACE,
        seeds = [b"stake".as_ref(), mint.key().as_ref(), config_account.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(
        mut,
        seeds = [b"user".as_ref(), user.key().as_ref()],
        bump = user_account.bump,
    )]
    pub user_account: Account<'info, UserAccount>, // passing user account to check if the user has already staked the max amount
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> Stake<'info> {
    pub fn stake(&mut self, bumps: &StakeBumps) -> Result<()> {

        require!(self.user_account.amount_staked < self.config_account.max_stake, StakeError::MaxStakeReached);

        self.stake_account.set_inner(StakeAccount {
            owner: self.user.key(),
            mint: self.mint.key(),
            staked_at: Clock::get()?.unix_timestamp,
            bump: bumps.stake_account,
        });

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = Approve { // approve the mint ata, delegate to stake account and sets authority as the user
            to: self.mint_ata.to_account_info(),
            delegate: self.stake_account.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        approve(cpi_ctx, 1)?; // reclaiming authority of 1 token because is 1 nft

        let seeds = &[
            b"stake",
            self.mint.to_account_info().key.as_ref(),
            self.config_account.to_account_info().key.as_ref(),
            &[self.stake_account.bump]
        ];
        let signer_seeds = &[&seeds[..]];

        let delegate = &self.stake_account.to_account_info(); // this stake account have authority of 1 token of mint ata
        let token_account = &self.mint_ata.to_account_info();
        let edition = &self.master_edition.to_account_info();
        let mint = &self.mint.to_account_info();
        let token_program = &self.token_program.to_account_info();
        let metadata_program = &self.metadata_program.to_account_info();

        FreezeDelegatedAccountCpi::new( // cpi to the token metadata program to freeze nfts
            metadata_program,
            FreezeDelegatedAccountCpiAccounts {
                delegate,
                token_account,
                edition,
                mint,
                token_program,
            },
        ).invoke_signed(signer_seeds)?; // need to be signed by the stake account, that got authority of 1 token

        self.user_account.amount_staked += 1;

        Ok(())
    }
}
