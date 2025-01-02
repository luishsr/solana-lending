import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { LendingProtocol } from '../target/types/lending_protocol';

describe('lending_protocol', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.LendingProtocol as Program<LendingProtocol>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
