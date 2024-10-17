import wallet from "./wallet/wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        // const image = ???
        const metadata = {
            name: "nukioRug",
            symbol: "nukio-ruggie",
            description: "my dogs rug",
            image: "https://devnet.irys.xyz/7R7Hp21cutHYdBvwPM3buuQyGSSqoCVHJTT7cTWwADVd",
            attributes: [
                {trait_type: 'background', value: 'black'},
                {trait_type: 'ableTo', value: 'fly'},
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: "https://devnet.irys.xyz/7R7Hp21cutHYdBvwPM3buuQyGSSqoCVHJTT7cTWwADVd",
                        // uri: "https://arweave.net/ARm8Zesgf1cfTrPhwWNUeeX8XwkYzap4aqqS6YtfVpr3" from nft_image
                    },
                ]
            },
            creators: [
                {
                    address: keypair.publicKey,
                    share: 50
                }
            ]
        };
        const myUri = await umi.uploader.uploadJson(metadata)
        console.log("Your metadata URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
