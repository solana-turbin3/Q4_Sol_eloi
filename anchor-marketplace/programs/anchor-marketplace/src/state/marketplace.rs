use anchor_lang::prelude::*;

#[account]
//#[derive(InitSpace)] dont forget 8 bytes for anchor discrimator
pub struct Marketplace {
    pub admin: Pubkey,
    pub fee: u16,
    pub treasury_bump: u8,
    pub rewards_bump: u8,
    pub bump: u8,
    //#[max_len(32)] to set max len of the String
    pub name: String, // Limit the String to 32 bytes
}

impl Space for Marketplace {
    const INIT_SPACE: usize = 8 + 32 + 2 + 1 + 1 + 1 + (4 + 32);
}
