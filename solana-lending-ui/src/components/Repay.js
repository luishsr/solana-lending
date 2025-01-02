import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '../solanaUtils';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

const Repay = () => {
    const wallet = useWallet();
    const [repayAmount, setRepayAmount] = useState('');

    const handleRepay = async () => {
        if (!wallet.connected) {
            alert('Please connect your wallet!');
            return;
        }

        const program = getProgram(wallet);
        try {
            const tx = await program.rpc.repay(new BN(repayAmount), {
                accounts: {
                    user: wallet.publicKey,
                    userLoanAccount: new PublicKey('UserLoanAccountPublicKey'),
                    vaultLoanAccount: new PublicKey('VaultLoanAccountPublicKey'),
                    loanAccount: new PublicKey('LoanAccountPublicKey'),
                    tokenProgram: new PublicKey('TokenProgramID'),
                },
            });
            alert(`Repay transaction successful: ${tx}`);
        } catch (error) {
            console.error(error);
            alert('Repay transaction failed.');
        }
    };

    return (
        <Box mb={2}>
            <TextField
                label="Amount to Repay"
                variant="outlined"
                fullWidth
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                type="number"
            />
            <Button variant="contained" color="primary" onClick={handleRepay} fullWidth>
                Repay
            </Button>
        </Box>
    );
};

export default Repay;
