use anchor_lang::prelude::*;

declare_id!("4HCZ6cN38fX1odvW43ckBawdDWAEffrXvKoC2gemLSoT");

#[program]
pub mod anchor_marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
