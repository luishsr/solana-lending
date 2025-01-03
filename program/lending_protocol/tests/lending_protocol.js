const anchor = require("@project-serum/anchor");
const { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } = require("@solana/spl-token");

describe("lending_protocol", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);

    const program = anchor.workspace.LendingProtocol;

    const userKeypair = anchor.web3.Keypair.generate();
    const liquidatorKeypair = anchor.web3.Keypair.generate();
    let mint;
    let userCollateralTokenAccount, vaultCollateralTokenAccount;
    let userLoanTokenAccount, vaultLoanTokenAccount;
    let userCollateralPda, userLoanPda, liquidatorCollateralPda, liquidatorLoanPda;

    before(async () => {
        // Airdrop SOL to user and liquidator
        await provider.connection.requestAirdrop(userKeypair.publicKey, anchor.web3.LAMPORTS_PER_SOL * 2);
        await provider.connection.requestAirdrop(liquidatorKeypair.publicKey, anchor.web3.LAMPORTS_PER_SOL * 2);

        // Create Mint
        mint = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 9);

        // Create Token Accounts
        userCollateralTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            mint,
            userKeypair.publicKey
        );
        vaultCollateralTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            mint,
            provider.wallet.publicKey
        );
        userLoanTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            mint,
            userKeypair.publicKey
        );
        vaultLoanTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            mint,
            provider.wallet.publicKey
        );

        // Mint Tokens to User Collateral Account
        await mintTo(provider.connection, provider.wallet.payer, mint, userCollateralTokenAccount.address, provider.wallet.publicKey, 1_000_000);

        // Derive PDAs
        [userCollateralPda] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("collateral"), userKeypair.publicKey.toBuffer()],
            program.programId
        );
        [userLoanPda] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("loan"), userKeypair.publicKey.toBuffer()],
            program.programId
        );

        // Initialize User Collateral Account
        await program.methods
            .initializeCollateralAccount()
            .accounts({
                collateralAccount: userCollateralPda,
                user: userKeypair.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([userKeypair])
            .rpc();

        // Initialize User Loan Account
        await program.methods
            .initializeLoanAccount()
            .accounts({
                loanAccount: userLoanPda,
                user: userKeypair.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([userKeypair])
            .rpc();
    });

    it("Deposit collateral", async () => {
        const depositAmount = new anchor.BN(500_000);
        await program.methods
            .deposit(depositAmount)
            .accounts({
                user: userKeypair.publicKey,
                userCollateralAccount: userCollateralTokenAccount.address,
                vaultCollateralAccount: vaultCollateralTokenAccount.address,
                collateralAccount: userCollateralPda,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([userKeypair])
            .rpc();
        console.log("Collateral deposited!");
    });

    it("Borrow funds", async () => {
        const borrowAmount = new anchor.BN(200_000);
        await program.methods
            .borrow(borrowAmount)
            .accounts({
                user: userKeypair.publicKey,
                userLoanAccount: userLoanTokenAccount.address,
                vaultLoanAccount: vaultLoanTokenAccount.address,
                collateralAccount: userCollateralPda,
                loanAccount: userLoanPda,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([userKeypair])
            .rpc();
        console.log("Borrow successful!");
    });

    it("Repay loan", async () => {
        const repayAmount = new anchor.BN(100_000);
        await program.methods
            .repay(repayAmount)
            .accounts({
                user: userKeypair.publicKey,
                userLoanAccount: userLoanTokenAccount.address,
                vaultLoanAccount: vaultLoanTokenAccount.address,
                loanAccount: userLoanPda,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([userKeypair])
            .rpc();
        console.log("Repay successful!");
    });

    it("Liquidate collateral", async () => {
        const liquidationAmount = new anchor.BN(300_000);
        await program.methods
            .liquidate(liquidationAmount)
            .accounts({
                liquidator: liquidatorKeypair.publicKey,
                vaultCollateralAccount: vaultCollateralTokenAccount.address,
                collateralAccount: userCollateralPda,
                loanAccount: userLoanPda,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([liquidatorKeypair])
            .rpc();
        console.log("Liquidation successful!");
    });
});
