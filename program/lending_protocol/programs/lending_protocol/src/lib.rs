use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("DbJCU2hB6xdRmfJ4YZFBTbVd9Sx4RqgTGyDqW25NrK1s");

#[program]
pub mod lending_protocol {
    use super::*;

    pub fn initialize_collateral_account(
        ctx: Context<InitializeCollateralAccount>,
    ) -> Result<()> {
        ctx.accounts.collateral_account.amount = 0;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        token::transfer(ctx.accounts.into_transfer_to_vault_context(), amount)?;
        ctx.accounts.collateral_account.amount += amount;
        Ok(())
    }

    pub fn borrow(ctx: Context<Borrow>, borrow_amount: u64) -> Result<()> {
        let collateral_value = ctx.accounts.collateral_account.amount;
        require!(
            borrow_amount <= collateral_value / 2,
            LendingError::InsufficientCollateral
        );

        token::transfer(ctx.accounts.into_transfer_to_user_context(), borrow_amount)?;
        ctx.accounts.loan_account.borrowed += borrow_amount;
        Ok(())
    }

    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        token::transfer(ctx.accounts.into_transfer_to_vault_context(), amount)?;
        ctx.accounts.loan_account.borrowed = ctx.accounts.loan_account.borrowed.saturating_sub(amount);
        Ok(())
    }

    pub fn liquidate(ctx: Context<Liquidate>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.loan_account.borrowed > ctx.accounts.collateral_account.amount / 2,
            LendingError::NotLiquidatable
        );

        let pda_seeds = &[b"vault".as_ref()];
        let signer = &[&pda_seeds[..]];

        token::transfer(
            ctx.accounts
                .into_transfer_to_liquidator_context()
                .with_signer(signer),
            amount,
        )?;
        ctx.accounts.collateral_account.amount = 0;
        ctx.accounts.loan_account.borrowed = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCollateralAccount<'info> {
    #[account(init, payer = user, space = 8 + 8)] // Account discriminator + u64 amount
    pub collateral_account: Account<'info, CollateralAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_collateral_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_collateral_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub collateral_account: Account<'info, CollateralAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_loan_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_loan_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub collateral_account: Account<'info, CollateralAccount>,
    #[account(mut)]
    pub loan_account: Account<'info, LoanAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_loan_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_loan_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub loan_account: Account<'info, LoanAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,
    #[account(mut)]
    pub vault_collateral_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub collateral_account: Account<'info, CollateralAccount>,
    #[account(mut)]
    pub loan_account: Account<'info, LoanAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct CollateralAccount {
    pub amount: u64,
}

#[account]
pub struct LoanAccount {
    pub borrowed: u64,
}

#[error_code]
pub enum LendingError {
    #[msg("Insufficient collateral for the requested loan.")]
    InsufficientCollateral,
    #[msg("Loan is not eligible for liquidation.")]
    NotLiquidatable,
}

impl<'info> Deposit<'info> {
    fn into_transfer_to_vault_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.user_collateral_account.to_account_info(),
                to: self.vault_collateral_account.to_account_info(),
                authority: self.user.to_account_info(),
            },
        )
    }
}

impl<'info> Borrow<'info> {
    fn into_transfer_to_user_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault_loan_account.to_account_info(),
                to: self.user_loan_account.to_account_info(),
                authority: self.user.to_account_info(),
            },
        )
    }
}

impl<'info> Repay<'info> {
    fn into_transfer_to_vault_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.user_loan_account.to_account_info(),
                to: self.vault_loan_account.to_account_info(),
                authority: self.user.to_account_info(),
            },
        )
    }
}

impl<'info> Liquidate<'info> {
    fn into_transfer_to_liquidator_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault_collateral_account.to_account_info(),
                to: self.liquidator.to_account_info(),
                authority: self.liquidator.to_account_info(),
            },
        )
    }
}
