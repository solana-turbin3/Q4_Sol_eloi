use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Invalid send amount")]
    InvalidAmount
}
