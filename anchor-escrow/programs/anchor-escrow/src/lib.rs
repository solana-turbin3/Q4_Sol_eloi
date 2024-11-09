use anchor_lang::prelude::*;

declare_id!("3MgDysPWFE1qLV4WKAHirhLZoBHDJUALE6Goz8sqo4Lb");

#[program]
pub mod anchor_escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
