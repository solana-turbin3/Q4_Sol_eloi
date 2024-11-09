use anchor_lang::prelude::*;

declare_id!("dfH8kKzBEKm28HoQysiPoU8qaYMxVg7vC2grFu9BFAR");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
