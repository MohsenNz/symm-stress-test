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

  const wallets = accounts.map((w) => [w.address, w.privateKey, w.mnemonic?.phrase].join("\n"));
  const privates = accounts.map((w) => w.privateKey);
  fs.writeFileSync("wallets.txt", wallets.join("\n\n"));
  fs.writeFileSync("privates.txt", privates.join("\n"));
}

async function fundAccounts(accounts: ethers.HDNodeWallet[]) {
  const amount = ethers.parseEther("3");

  let nonce = await master.getNonce();

  for (const w of accounts) {
    const tx = await master.sendTransaction({
      to: w.address,
      value: amount,
      nonce,
    });

    await tx.wait();
    nonce += 1;
  }

  console.log("All accounts funded.");
}

// ----------------------------------------------------------------------------

main().catch((err) => {
  console.error("Script failed:", err);
});
