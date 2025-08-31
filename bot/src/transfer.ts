import * as solanaWeb3 from '@solana/web3.js';
import * as bs58 from 'bs58';

async function transferSol() {
  // Connect to cluster
  const connection = new solanaWeb3.Connection("https://rpc.gorbchain.xyz",{
    wsEndpoint:"wss://rpc.gorbchain.xyz/ws"
  });

  // Load sender's keypair from secret key array (Uint8Array or array of numbers)
  const pvt = "";
  const fromKeypair = solanaWeb3.Keypair.fromSecretKey(bs58.default.decode(pvt));
  // Create destination PublicKey
  const toPublicKey = new solanaWeb3.PublicKey("GiGADPr1aThAUJDGnRS6KU9P5SbJ23E9qMUqWoXP1vGJ");

  // Convert amount in SOL to lamports (1 SOL = 1_000_000_000 lamports)
  const lamports = 10 * solanaWeb3.LAMPORTS_PER_SOL;

  // Create a transaction to transfer lamports
  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: lamports,
    }),
  );

  // Send and confirm the transaction
  const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [fromKeypair]);

  console.log('Transaction signature', signature);
}



transferSol().catch(console.error);
