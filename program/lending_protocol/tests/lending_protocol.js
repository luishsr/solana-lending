const anchor = require("@project-serum/anchor");
const { PublicKey, SystemProgram, Keypair } = require("@solana/web3.js");
const {
    TOKEN_PROGRAM_ID,
    createMint,
    createAssociatedTokenAccount,
    mintTo,
} = require("@solana/spl-token");
const assert = require("chai").assert;

describe("lending_protocol", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);

    const program = anchor.workspace.LendingProtocol;

    let mint;
    let user;
    let userTokenAccount;
    let vaultTokenAccount;
    let collateralAccount;

    before(async () => {
        user = Keypair.generate();

        // Airdrop SOL
        const airdropSignature = await provider.connection.requestAirdrop(
            user.publicKey,
            anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(airdropSignature);

        // Create a mint
        mint = await createMint(
            provider.connection,
            provider.wallet.payer,
            provider.wallet.publicKey,
            null,
            6
        );

        // Create associated token accounts
        userTokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            mint,
            user.publicKey
        );

        vaultTokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            provider.wallet.payer,
            mint,
            provider.wallet.publicKey
        );

        // Mint tokens to user
        await mintTo(
            provider.connection,
            provider.wallet.payer,
            mint,
            userTokenAccount,
            provider.wallet.publicKey,
            1000
        );

        // Initialize collateral account
        collateralAccount = Keypair.generate();

        await program.methods
            .initializeCollateralAccount()
            .accounts({
                collateralAccount: collateralAccount.publicKey,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([collateralAccount])
            .rpc();
    });

    it("Initializes a deposit", async () => {
        const amount = 100;

        await program.rpc.deposit(new anchor.BN(amount), {
            accounts: {
                user: user.publicKey,
                userCollateralAccount: userTokenAccount,
                vaultCollateralAccount: vaultTokenAccount,
                collateralAccount: collateralAccount.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            signers: [user],
        });

        console.log("Deposit successful");
        assert.ok(true);
    });
});
