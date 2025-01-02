import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '../solanaUtils';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

const Liquidate = () => {
    const wallet = useWallet();
    const [liquidateAmount, setLiquidateAmount] = useState('');

    const handleLiquidate = async () => {
        if (!wallet.connected) {
            alert('Please connect your wallet!');
            return;
        }

        const program = getProgram(wallet);
        try {
            const tx = await program.rpc.liquidate(new BN(liquidateAmount), {
                accounts: {
                    liquidator: wallet.publicKey,
                    vaultCollateralAccount: new PublicKey('VaultCollateralAccountPublicKey'),
                    collateralAccount: new PublicKey('CollateralAccountPublicKey'),
                    loanAccount: new PublicKey('LoanAccountPublicKey'),
                    tokenProgram: new PublicKey('TokenProgramID'),
                },
            });
            alert(`Liquidate transaction successful: ${tx}`);
        } catch (error) {
            console.error(error);
            alert('Liquidate transaction failed.');
        }
    };

    return (
        <Box mb={2}>
            <TextField
                label="Amount to Liquidate"
                variant="outlined"
                fullWidth
                value={liquidateAmount}
                onChange={(e) => setLiquidateAmount(e.target.value)}
                type="number"
            />
            <Button variant="contained" color="primary" onClick={handleLiquidate} fullWidth>
                Liquidate
            </Button>
        </Box>
    );
};

export default Liquidate;
