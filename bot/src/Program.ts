// import * as anchor from "@coral-xyz/anchor";
// import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes/index.js";
// import { Keypair, PublicKey, SystemProgram, Connection, Transaction } from "@solana/web3.js";
// import * as fs from 'fs';
// import "dotenv/config";

// // Test file for: create_profile function
// // Function: Creates a new profile PDA for username with validation

// const RPC_ENDPOINT = 'https://rpc.gorbchain.xyz';
// const WS_ENDPOINT = 'wss://rpc.gorbchain.xyz/ws/';
// const connection = new Connection(RPC_ENDPOINT, {
//   commitment: 'confirmed',
//   wsEndpoint: WS_ENDPOINT,
// });

// // Load wallet from ~/.config/solana/id.json or environment variable
// let walletKeypair: Keypair;

// if (process.env.PVT) {
//   // Use private key from environment variable
//   walletKeypair = Keypair.fromSecretKey(bs58.decode(process.env.PVT!));
// } else {
//   // Generate a temporary keypair for testing
//   console.log("⚠️  PVT environment variable not set. Generating temporary keypair for testing.");
//   walletKeypair = Keypair.generate();
//   console.log("Generated keypair public key:", walletKeypair.publicKey.toString());
//   console.log("Generated keypair private key (base58):", bs58.encode(walletKeypair.secretKey));
// }

// const provider = new anchor.AnchorProvider(
//   connection,
//   new anchor.Wallet(walletKeypair),
//   { commitment: 'confirmed' }
// );
// anchor.setProvider(provider);

// const program = new anchor.Program('./Profile.json', provider);
// // Create a minimal program interface for testing
// const programId = new PublicKey('GrJrqEtxztquco6Zsg9WfrArYwy5BZwzJ4ce4TfcJLuJ');

// // Mock program object for testing
// // const program = {
// //   programId,
// //   methods: {
// //     createProfile: (username: string, bio: string, avatar: string, twitter: string, discord: string, website: string) => ({
// //       accounts: (accounts: any) => ({
// //         signers: (signers: any) => ({
// //           rpc: async () => {
// //             console.log(`Mock transaction: createProfile(${username})`);
// //             return "mock_tx_signature";
// //           }
// //         })
// //       })
// //     })
// //   },
// //   account: {
// //     profile: {
// //       fetch: async (pda: PublicKey) => ({
// //         username: "amit7",
// //         authority: new PublicKey("11111111111111111111111111111111"),
// //         mainAddress: new PublicKey("11111111111111111111111111111111"),
// //         bio: "test bio",
// //         avatar: "test avatar",
// //         twitter: "test twitter",
// //         discord: "test discord",
// //         website: "test website"
// //       })
// //     },
// //     reverseLookup: {
// //       fetch: async (pda: PublicKey) => ({
// //         username: "test_username"
// //       })
// //     }
// //   }
// // } as any;

// // Helper functions for PDA derivation

// const profilePda = (username: string) =>
//   PublicKey.findProgramAddressSync(
//     [Buffer.from("profile"), Buffer.from(username)],
//     program.programId
//   );

// const reversePda = (main: PublicKey) =>
//   PublicKey.findProgramAddressSync(
//     [Buffer.from("reverse"), main.toBuffer()],
//     program.programId
//   );

// // Test data
// const timestamp = Date.now().toString();
// const randomSuffix = Math.random().toString(36).substring(2, 8);
// const username = `test1_${timestamp}_${randomSuffix}`.slice(-20); // Keep under 32 chars, add function identifier
// const owner = Keypair.generate();
// const other = Keypair.generate();

// const bio = "Hello bio for testing";
// const avatar = "ipfs://testavatar";
// const twitter = "test_handle";
// const discord = "test#1234";
// const website = "https://test.example";



// // Test runner function
// async function runTest(testName: string, testFunction: () => Promise<void>) {
//   console.log(`\n🧪 Running: ${testName}`);
//   console.log("=".repeat(50));
  
//   try {
//     await testFunction();
//     console.log(`✅ ${testName} - PASSED`);
//   } catch (error: any) {
//     console.log(`❌ ${testName} - FAILED:`, error.message);
//   }
  
//   console.log("=".repeat(50));
// }

// // Utility function to create a profile for testing
// let testCaseCounter = 0;
// async function createTestProfile() {
//   console.log("Creating test profile for create_profile tests...");
  
//   // Generate a new owner keypair for each test case to avoid conflicts
//   // const testOwner = Keypair.generate();
  
//   // Generate unique username for this test case
//   testCaseCounter++;
//   const testTimestamp = Date.now().toString();
//   const testRandomSuffix = Math.random().toString(36).substring(2, 8);
//   const testUsername = `test1_${testCaseCounter}_${testTimestamp}_${testRandomSuffix}`.slice(-20);
  
//   const [profilePDA] = profilePda(testUsername);
//   const [reversePDA] = reversePda(owner.publicKey);
  
//   const tx = await program.methods
//     .createProfile(testUsername, bio, avatar, twitter, discord, website)
//     .accounts({
//       authority: owner.publicKey,
//       profile: profilePDA,
//       reverse: reversePDA,
//       systemProgram: SystemProgram.programId,
//     })
//     .signers([owner])
//     .rpc();
  
//   console.log("✅ Test profile created:", tx);
//   return { profilePDA, username: testUsername, owner: owner };
// }

// // ============================================================================
// // TEST CASE 1.1: ✅ Create Profile (Happy Path)
// // ============================================================================
// async function testCreateProfileHappyPath() {
//   console.log("Testing successful profile creation with valid data");
  
  
//   // 2. Prepare PDAs
//   const [profilePDA] = profilePda(username);
//   const [reversePDA] = reversePda(owner.publicKey);
  
//   console.log("Profile PDA:", profilePDA.toString());
//   console.log("Reverse PDA:", reversePDA.toString());
  
//   // 3. Call create_profile
//   const tx = await program.methods
//     .createProfile(username, bio, avatar, twitter, discord, website)
//     .accounts({
//       authority: owner.publicKey,
//       profile: profilePDA,
//       reverse: reversePDA,
//       systemProgram: SystemProgram.programId,
//     })
//     .signers([owner])
//     .rpc();

//   console.log("Transaction Signature:", tx);
  
//   console.log("✅ Profile created:", tx);
  
//   // 4. Verify profile data
//   const profile = await (program.account as any).profile.fetch(profilePDA);
//   console.log("Profile:", {
//     username: profile.username,
//     authority: profile.authority.toString(),
//     mainAddress: profile.mainAddress.toString(),
//     bio: profile.bio,
//     avatar: profile.avatar,
//     twitter: profile.twitter,
//     discord: profile.discord,
//     website: profile.website,
//   });
  
//   // 5. Verify reverse lookup
//   const reverse = await (program.account as any).reverseLookup.fetch(reversePDA);
//   console.log("Reverse lookup:", reverse.username);
  
//   // Verify all data matches input
//   if (profile.username !== username) throw new Error("Username mismatch");
//   if (profile.authority.toString() !== owner.publicKey.toString()) throw new Error("Authority mismatch");
//   if (profile.mainAddress.toString() !== owner.publicKey.toString()) throw new Error("Main address mismatch");
//   if (profile.bio !== bio) throw new Error("Bio mismatch");
//   if (profile.avatar !== avatar) throw new Error("Avatar mismatch");
//   if (profile.twitter !== twitter) throw new Error("Twitter mismatch");
//   if (profile.discord !== discord) throw new Error("Discord mismatch");
//   if (profile.website !== website) throw new Error("Website mismatch");
//   if (reverse.username !== username) throw new Error("Reverse lookup username mismatch");
  
//   console.log("✅ All profile data verified successfully");
// }

// // ============================================================================
// // MAIN TEST RUNNER
// // ============================================================================
// async function runAllCreateProfileTests() {
//   console.log("🚀 Starting create_profile Function Tests");
//   console.log("Program ID:", program.programId.toString());
//   console.log("Username:", username);
//   console.log("Owner:", owner.publicKey.toString());
  
//   // Run tests in order
//   await runTest("1.1 Create Profile (Happy Path)", testCreateProfileHappyPath);
  
//   console.log("\n🎉 All create_profile tests completed!");
// }

// // Export for individual testing

// // Run tests if this file is executed directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   // runAllCreateProfileTests().catch(console.error);
//   // createTestProfile().catch(console.error);
// } 