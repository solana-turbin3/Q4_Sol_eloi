import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "./wallet/wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("95Ti8tGX69Tp66KWUxvGwTawb2a5Xwd48UDd4ktXc3fm");

(async () => {
    try {
        // Create an ATA
        const ata = await getOrCreateAssociatedTokenAccount(connection, keypair,mint, keypair.publicKey)
        console.log(`Your ata is: ${ata.address.toBase58()}`);
        const ataPublicKey = new PublicKey(ata.address.toBase58())

        // Mint to ATA
         const mintTx = await mintTo(connection,keypair, mint, ataPublicKey, keypair, token_decimals)
        console.log(`Your mint txid: ${mintTx}`);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()

// $ ts-node ./cluster1/spl_mint.ts
// Your ata is: 9dLv86GNiJpwGqYKojmGHzBCSVE3L3HpDUXgBff8xH9y
// Your mint txid: 2WHY8qwDjs3DtYvpsT9YjpE9XmZpV3NYSLwNBmUyhLALVBzrTxmbYp9ecp82hkp1emabL37ArvcyVFPeVU3CVxw6
// ✨  Done in 3.12s.

//https://explorer.solana.com/tx/2WHY8qwDjs3DtYvpsT9YjpE9XmZpV3NYSLwNBmUyhLALVBzrTxmbYp9ecp82hkp1emabL37ArvcyVFPeVU3CVxw6?cluster=devnet
