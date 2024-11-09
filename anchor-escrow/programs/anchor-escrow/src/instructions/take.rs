use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{transfer_checked, TokenInterface, TransferChecked, CloseAccount, Mint, TokenAccount}};
use anchor_spl::token_interface::close_account;

use crate::states::escrow::Escrow;
use crate::error::Errors;

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mut)]
    pub maker: SystemAccount<'info>,
    pub mint_a: InterfaceAccount<'info, Mint>,
    pub mint_b: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_a,
        associated_token::authority = taker
    )]
    pub taker_ata_a: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = taker
    )]
    pub taker_ata_b: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_b,
        associated_token::authority = taker
    )]
    pub maker_ata_b: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        has_one = maker,
        has_one = mint_a,
        has_one = mint_b,
        seeds= [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = maker
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>
}

impl<'info> Take<'info> {
    pub fn deposit_b_amount(&mut self) -> Result<()> {

        require!(self.taker_ata_b.amount >= self.escrow.receive, Errors::InvalidAmount);


        let transfer_maker = TransferChecked {
            authority: self.taker.to_account_info(),
            from: self.taker_ata_b.to_account_info(),
            mint: self.mint_a.to_account_info(),
            to: self.maker_ata_b.to_account_info()
        };

        let transfer_cpi_context = CpiContext::new(self.token_program.to_account_info(), transfer_maker);

        transfer_checked(transfer_cpi_context, self.escrow.receive, self.mint_b.decimals)
    }

    pub fn withdraw_a_amount_and_close_vault(&mut self) -> Result<()> {

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump]
        ]];

        let withdraw_a_funds = TransferChecked {
            authority: self.escrow.to_account_info(),
            from: self.vault.to_account_info(),
            to: self.taker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info()
        };

        let transfer_cpi_context = CpiContext::new_with_signer(self.token_program.to_account_info()
        , withdraw_a_funds,
        &signer_seeds);

        transfer_checked(transfer_cpi_context, self.vault.amount, self.mint_a.decimals)?;

        let close_accounts = CloseAccount{
            account: self.vault.to_account_info(),
            destination: self.taker.to_account_info(),
            authority: self.escrow.to_account_info()
        };

        let close_cpi_context = CpiContext::new_with_signer(self.token_program.to_account_info(),
        close_accounts,
        &signer_seeds
        );

        close_account(close_cpi_context)

    }
}
