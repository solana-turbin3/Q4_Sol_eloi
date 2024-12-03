import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';

import { GateChecker } from './target/types/gate_checker';

describe('gateCheck', () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();

  const connection = provider.connection;

  const program = anchor.workspace.GateChecker as Program<GateChecker>;

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  // Accounts
  const main_wallet = Keypair.generate();
  const nft = Keypair.generate();

  const accountsPublicKeys = {
    main_wallet: main_wallet.publicKey,
    nft: nft.publicKey,
    associatedTokenprogram: ASSOCIATED_TOKEN_PROGRAM_ID,

    tokenProgram: TOKEN_PROGRAM_ID,

    systemProgram: SystemProgram.programId
  };

  it('setup', async () => {
    let lamports = await getMinimumBalanceForRentExemptMint(connection);
    let tx = new Transaction();
    tx.instructions = [
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: main_wallet.publicKey,
        lamports: 10 * LAMPORTS_PER_SOL
      }),
      SystemProgram.createAccount({
        fromPubkey: provider.publicKey,
        newAccountPubkey: nft.publicKey,
        lamports,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID
      })
    ];
    await provider.sendAndConfirm(tx, [nft, main_wallet]).then(log);
  });

  it('Nfttest', async () => {
    const accounts = {
      associatedTokenAccount: accountsPublicKeys['nft'],
      associatedTokenProgram: accountsPublicKeys['associated_token_program'],
      mint: accountsPublicKeys['nft'],
      rent: accountsPublicKeys['main_wallet'],
      signer: accountsPublicKeys['main_wallet'],
      systemProgram: accountsPublicKeys['system_program'],
      tokenProgram: accountsPublicKeys['token_program']
    };
    await program.methods
      .initNft()
      .accounts({ ...accounts })
      .signers([signer, mint])
      .rpc()
      .then(confirm)
      .then(log);
  });
  it('first', async () => {
    const accounts = {};
    await program.methods
      .initNft()
      .accounts({ ...accounts })
      .signers([signer, mint])
      .rpc()
      .then(confirm)
      .then(log);
  });
});
