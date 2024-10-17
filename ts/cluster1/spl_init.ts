import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';
import wallet from "./wallet/wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
    try {
        // Start here
        const mintTx = await createMint(connection, keypair, keypair.publicKey, null, 6); // 1 SOL = 1.000.000.000 Lamports
        console.log('mintTx', mintTx);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
