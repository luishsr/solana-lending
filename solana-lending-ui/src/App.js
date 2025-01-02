import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { CssBaseline, Container, Typography } from '@mui/material';
import Deposit from './components/Deposit';
import Borrow from './components/Borrow';
import Repay from './components/Repay';
import Liquidate from './components/Liquidate';

const network = 'http://localhost:8899';

const wallets = [new PhantomWalletAdapter()];

const App = () => {
    return (
        <ConnectionProvider endpoint={network}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <CssBaseline />
                    <Container maxWidth="md">
                        <Typography variant="h4" align="center" gutterBottom>
                            Solana Lending Protocol
                        </Typography>
                        <Deposit />
                        <Borrow />
                        <Repay />
                        <Liquidate />
                    </Container>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App;
