use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::state::StakeConfig;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>, // account that initializes the config and rewards mint
    #[account(
        init,
        payer = admin,
        seeds = [b"config".as_ref()], // 1 config account to the whole program, don't need to pass admin key
        bump,
        space = StakeConfig::INIT_SPACE,
    )]
    pub config_account: Account<'info, StakeConfig>,
    #[account(
        init_if_needed,
        payer = admin,
        seeds = [b"rewards".as_ref(), config_account.key().as_ref()],
        bump,
        mint::decimals = 6, // mint is initialized(Mint imported) that will reward the user
        mint::authority = config_account,
    )]
    pub rewards_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> InitializeConfig<'info> {
    pub fn initialize_config(&mut self, points_per_stake: u8, max_stake: u8, freeze_period: u32, bumps: &InitializeConfigBumps) -> Result<()> {
        self.config_account.set_inner(StakeConfig {
            points_per_stake,
            max_stake,
            freeze_period,
            rewards_bump: bumps.rewards_mint,
            bump: bumps.config_account,
        });

        Ok(())
    }
}
