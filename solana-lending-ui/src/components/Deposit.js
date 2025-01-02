import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '../solanaUtils';
import { PublicKey } from '@solana/web3.js'; // Import for PublicKey
import { BN } from '@project-serum/anchor'; // Import for BN

const Deposit = () => {
    const wallet = useWallet();
    const [amount, setAmount] = useState('');

    const handleDeposit = async () => {
        if (!wallet.connected) {
            alert('Please connect your wallet!');
            return;
        }

        const program = getProgram(wallet);
        try {
            const tx = await program.rpc.deposit(new BN(amount), {
                accounts: {
                    user: wallet.publicKey,
                    userCollateralAccount: new PublicKey('UserCollateralAccountPublicKey'),
                    vaultCollateralAccount: new PublicKey('VaultCollateralAccountPublicKey'),
                    collateralAccount: new PublicKey('CollateralAccountPublicKey'),
                    tokenProgram: new PublicKey('TokenProgramID'),
                    collateralMint: new PublicKey('CollateralMintPublicKey'),
                },
            });
            alert(`Transaction successful: ${tx}`);
        } catch (error) {
            console.error(error);
            alert('Transaction failed.');
        }
    };

    return (
        <Box mb={2}>
            <TextField
                label="Amount to Deposit"
                variant="outlined"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
            />
            <Button variant="contained" color="primary" onClick={handleDeposit} fullWidth>
                Deposit
            </Button>
        </Box>
    );
};

export default Deposit;
