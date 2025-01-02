import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '../solanaUtils';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

const Borrow = () => {
    const wallet = useWallet();
    const [borrowAmount, setBorrowAmount] = useState('');

    const handleBorrow = async () => {
        if (!wallet.connected) {
            alert('Please connect your wallet!');
            return;
        }

        const program = getProgram(wallet);
        try {
            const tx = await program.rpc.borrow(new BN(borrowAmount), {
                accounts: {
                    user: wallet.publicKey,
                    userLoanAccount: new PublicKey('UserLoanAccountPublicKey'),
                    vaultLoanAccount: new PublicKey('VaultLoanAccountPublicKey'),
                    collateralAccount: new PublicKey('CollateralAccountPublicKey'),
                    loanAccount: new PublicKey('LoanAccountPublicKey'),
                    tokenProgram: new PublicKey('TokenProgramID'),
                },
            });
            alert(`Borrow transaction successful: ${tx}`);
        } catch (error) {
            console.error(error);
            alert('Borrow transaction failed.');
        }
    };

    return (
        <Box mb={2}>
            <TextField
                label="Amount to Borrow"
                variant="outlined"
                fullWidth
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                type="number"
            />
            <Button variant="contained" color="primary" onClick={handleBorrow} fullWidth>
                Borrow
            </Button>
        </Box>
    );
};

export default Borrow;
