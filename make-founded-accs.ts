import { ethers } from "ethers";

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
  accounts.forEach((w, i) => {
    console.log(i, w.address);
  });
}

async function fundAccounts(accounts: ethers.HDNodeWallet[]) {
  const amount = ethers.parseEther("5");

  const txs: Promise<any>[] = [];

  for (const w of accounts) {
    const tx = master.sendTransaction({
      to: w.address,
      value: amount
    });

    txs.push(tx);
  }

  const sent = await Promise.all(txs);

  console.log("Transactions sent. Waiting for confirmations...");

  await Promise.all(sent.map(tx => tx.wait()));

  console.log("All accounts funded.");
}

// ----------------------------------------------------------------------------

main().catch((err) => {
  console.error("Script failed:", err);
});
