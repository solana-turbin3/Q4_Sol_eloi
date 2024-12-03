import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

import { GateChecker } from '../target/types/gate_checker';
import { assert } from 'chai';

describe('NFT_mint', () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();

  const connection = provider.connection;

  const program = anchor.workspace.GateChecker as Program<GateChecker>;

  const METADATA_SEED = 'metadata'; // Seed for the metadata account
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const MINT_SEED = 'mintTurbin3';
  const payer = program.provider.publicKey;

  const metadata = {
    name: 'Turbin3 token_',
    symbol: 'TRB',
    uri: "https://raw.githubusercontent.com/eloiweb3/gate-checker/refs/heads/main/assets/nft-metadata.json",
    decimals: 0
  }; // Metadata for the NFT

  const mintAmount = 5;

  const [mint] = PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED, 'utf-8')], // Seed for the mint account
    program.programId
  );

  const [metadataAddress] = PublicKey.findProgramAddressSync(
    [Buffer.from(METADATA_SEED, 'utf-8'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };
  const mintAuthority = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('authority')],
    program.programId
  )[0];

  it('Initialize Token', async () => {
    const info = await program.provider.connection.getAccountInfo(mint);
    if (info) {
      return;
    }
    console.log('Mint not found. Initializing...');

    const context = {
      metadata: metadataAddress,
      mint,
      payer,
      mintAuthority,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID
    };

    const txHash = await program.methods.initNfts(metadata).accounts(context).rpc();

    await program.provider.connection.confirmTransaction(txHash); // Confirm the transaction
    log(txHash);
    const newInfo = await program.provider.connection.getAccountInfo(mint);
    assert(newInfo, 'Mint should be initialized');
  });

  it('Mint token', async () => {
    const destination = await anchor.utils.token.associatedAddress({
      owner: payer,
      mint: mint
    });

    let initialBalance: number;

    try {
      const balance = await program.provider.connection.getTokenAccountBalance(destination);
      initialBalance = balance.value.uiAmount;
    } catch (error) {
      //Token account not yet initialized, then has 0 balance
      initialBalance = 0;
    }

    const context = {
      mint,
      destinationAtaV1: destination,
      payer,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID
    };

    const txHash = await program.methods.mintNfts(new BN(5)).accounts(context).rpc(); // Mint 5 tokens
    await program.provider.connection.confirmTransaction(txHash); // Confirm the transaction
    log(txHash);

    const postBalance = (await program.provider.connection.getTokenAccountBalance(destination))
      .value.uiAmount;

    assert.equal(
      initialBalance + mintAmount,
      postBalance,
      'Post balance should be equal initial plus mint amount'
    );
  });

  it('Transfer token', async () => {
    const key = anchor.AnchorProvider.env().wallet.publicKey;
    // Generate a random keypair that will represent our token
    console.log('key', key);
    // const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    let associatedTokenAccount1 = await getAssociatedTokenAddress(mint, key);
    // let associatedTokenAccount2 = await getAssociatedTokenAddress(mint, key);
    // let associatedTokenAccount3 = await getAssociatedTokenAddress(mint, key);
    // let associatedTokenAccount4 = await getAssociatedTokenAddress(mint, key);
    // let associatedTokenAccount5 = await getAssociatedTokenAddress(mint, key);
    // Get anchor's wallet's public key
    // const myWallet = anchor.AnchorProvider.env().wallet.publicKey;
    // Wallet that will receive the token
    const toWallet1: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const toWallet2: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const toWallet3: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const toWallet4: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const toWallet5: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    // The ATA for a token on the to wallet (but might not exist yet)
    const toATA1 = await getAssociatedTokenAddress(mint, toWallet1.publicKey);
    const toATA2 = await getAssociatedTokenAddress(mint, toWallet2.publicKey);
    const toATA3 = await getAssociatedTokenAddress(mint, toWallet3.publicKey);
    const toATA4 = await getAssociatedTokenAddress(mint, toWallet4.publicKey);
    const toATA5 = await getAssociatedTokenAddress(mint, toWallet5.publicKey);
    // Fires a list of instructions
    const mint_tx1 = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        key,
        toATA1,
        toWallet1.publicKey,
        mint
      )
    );
    const mint_tx2 = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        key,
        toATA2,
        toWallet2.publicKey,
        mint
      )
    );
    const mint_tx3 = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        key,
        toATA3,
        toWallet3.publicKey,
        mint
      )
    );
    const mint_tx4 = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        key,
        toATA4,
        toWallet4.publicKey,
        mint
      )
    );
    const mint_tx5 = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        key,
        toATA5,
        toWallet5.publicKey,
        mint
      )
    );

    // Sends and create the transaction
     const res1 = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx1, []);
     const res2 = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx2, []);
     const res3 = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx3, []);
     const res4 = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx4, []);
     const res5 = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx5, []);

     console.log('res1', res1);
     console.log('res2', res2);
     console.log('res3', res3);
     console.log('res4', res4);
     console.log('res5', res5);


    // Executes our transfer smart contract
     const txHash1 =  await program.methods
      .transferToken()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount1,
        fromAuthority: key,
        to: toATA1
      })
      .rpc();
     const txHash2 =  await program.methods
      .transferToken()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount1,
        fromAuthority: key,
        to: toATA2
      })
      .rpc();
     const txHash3 =  await program.methods
      .transferToken()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount1,
        fromAuthority: key,
        to: toATA3
      })
      .rpc();
     const txHash4 =  await program.methods
      .transferToken()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount1,
        fromAuthority: key,
        to: toATA4
      })
      .rpc();
     const txHash5 =  await program.methods
      .transferToken()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount1,
        fromAuthority: key,
        to: toATA5
      })
      .rpc();

      console.log('txHash1', txHash1);
      console.log('txHash2', txHash2);
      console.log('txHash3', txHash3);
      console.log('txHash4', txHash4);
      console.log('txHash5', txHash5);

      await program.provider.connection.confirmTransaction(txHash1); // Confirm the transaction

    // Get minted token amount on the ATA for our anchor wallet
    const minted = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount1))
      .value

      console.log('minted', minted);

      //log(txHash);
    // assert.equal(minted, 0, 'Minted should be 0');
  });
});
