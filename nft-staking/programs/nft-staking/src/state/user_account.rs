use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)] // size of this account
pub struct UserAccount {
    pub points: u32,
    pub amount_staked: u8, // u8 -> 266 limit
    pub bump: u8,
}
