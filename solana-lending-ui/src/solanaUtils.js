import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import idl from './lending_protocol.json';

const network = 'https://api.devnet.solana.com';
const connection = new Connection(network, 'processed');
const programId = new PublicKey('LndngPgrm1111111111111111111111111111111111');

export const getProvider = (wallet) => {
    return new AnchorProvider(connection, wallet, { preflightCommitment: 'processed' });
};

export const getProgram = (wallet) => {
    const provider = getProvider(wallet);
    return new Program(idl, programId, provider);
};
