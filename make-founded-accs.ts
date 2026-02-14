import { ethers } from "ethers";
import fs from "fs";

const PK = process.env.PK!;
const RPC_URL = process.env.RPC_URL!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const master = new ethers.Wallet(PK, provider);

async function main() {
  const accounts: ethers.HDNodeWallet[] = [];
  for (let i = 0; i < 100; i++) {
    const wallet = ethers.Wallet.createRandom();
    accounts.push(wallet);
  }

  await fundAccounts(accounts);

  console.log("Generated accounts:");
  const wallets = accounts.map((w) => [w.address, w.privateKey, w.mnemonic].join("\n"));
  fs.writeFileSync("wallets.txt", wallets.join("\n\n"));
}

async function fundAccounts(accounts: ethers.HDNodeWallet[]) {
  const amount = ethers.parseEther("5");

  for (const w of accounts) {
    const tx = await master.sendTransaction({
      to: w.address,
      value: amount
    });

    await tx.wait()
  }

  console.log("All accounts funded.");
}

// ----------------------------------------------------------------------------

main().catch((err) => {
  console.error("Script failed:", err);
});
