import { ethers } from "ethers";
import { privates } from "./privates";

// ----------------------------------------------------------------------------
// -- CONFIG
const RPC_URL = unOpt(process.env.RPC_URL);
// const WALLET_PRIVATE_KEY = unOpt(process.env.PK);
const CONTRACT_ADDRESS = "0x356380855afCb805d4Fc1f55e92089a05BEADF18";
const ABI = [
  "function setNumber(uint256 num) external"
];
const reqCount = 10;

// ----------------------------------------------------------------------------
// -- PROVIDER & WALLET
const provider = new ethers.JsonRpcProvider(RPC_URL);
// const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
// const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const wallets = privates.map((pk) => new ethers.Wallet(pk, provider))

// ----------------------------------------------------------------------------
// -- Types

type txResult = {
  sentElapsed: number, // seconds
  minedElapsed: number, // seconds
  success: boolean
}

type Out = {
  reqCountAll: number,
  reqCountSucc: number,
  sentAvgTimeAll: number,
  sentAvgTimeSucc: number,
  sentMinTime: number,
  sentMaxTime: number,
  sentMedTime: number,

  mindAvgTimeAll: number,
  mindAvgTimeSucc: number,
  mindMinTime: number,
  mindMaxTime: number,
  mindMedTime: number,
}

//-------------------------------------------------------
// -- Def

async function main() {
  // Get starting nonce
  // const baseNonce = await wallet.getNonce();

  const txPromises: Promise<void>[] = [];
  const txRes: txResult[] = [];

  // for (let i = 0; i < reqCount; i++) {
  let i = 1;
  for (const wallet of wallets) {
    // const nonce = baseNonce + i;

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const txPromise = (async () => {
      try {
        const sentAt = Date.now();

        const tx = await contract.setNumber(i++, {
          // nonce,
          gasLimit: 100_000
        });
        const sentElapsed = (Date.now() - sentAt) / 1000; // seconds

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        const minedElapsed = (Date.now() - sentAt) / 1000; // seconds
        const success = receipt.status === 1 ? true : false;
        txRes[i] = { sentElapsed, minedElapsed, success }

      } catch (err: any) {
        console.error(`Tx ${i} failed: ${err.message}`);
      }
    })();

    txPromises.push(txPromise);
  }

  await Promise.all(txPromises);

  const timeSuccSents = txRes.filter((x) => x.success).map((x) => x.sentElapsed);
  const timeSuccMineds = txRes.filter((x) => x.success).map((x) => x.minedElapsed);

  console.debug("timeSuccsSent: ", timeSuccSents); // debug
  console.debug("timeSuccsMined: ", timeSuccMineds); // debug

  const out: Out = {
    reqCountAll: reqCount,
    reqCountSucc: txRes.filter((x) => x.success).length,

    sentAvgTimeAll: txRes.reduce((acc, x) => acc + x.sentElapsed, 0) / txRes.length,
    sentAvgTimeSucc: timeSuccSents.reduce((acc, x) => acc + x, 0) / txRes.length,
    sentMinTime: Math.min(...timeSuccSents),
    sentMaxTime: Math.max(...timeSuccSents),
    sentMedTime: median(timeSuccSents) || 0,

    mindAvgTimeAll: txRes.reduce((acc, x) => acc + x.minedElapsed, 0) / txRes.length,
    mindAvgTimeSucc: timeSuccMineds.reduce((acc, x) => acc + x, 0) / txRes.length,
    mindMinTime: Math.min(...timeSuccMineds),
    mindMaxTime: Math.max(...timeSuccMineds),
    mindMedTime: median(timeSuccMineds) || 0,
  }

  // console.log(JSON.stringify(out, null, 2));
  printOut(out)
}

function printOut(o: Out) {
  const reqCountFailed = o.reqCountAll - o.reqCountSucc

  console.log("requst duration (sent):")
  console.log("  average (all)    :", o.sentAvgTimeAll.toFixed(3))
  console.log("  average (success):", o.sentAvgTimeSucc.toFixed(3))
  console.log("  min              :", o.sentMinTime.toFixed(3))
  console.log("  max              :", o.sentMaxTime.toFixed(3))
  console.log("  med              :", o.sentMedTime.toFixed(3))
  console.log("requst duration (mined):")
  console.log("  average (all)    :", o.mindAvgTimeAll.toFixed(3))
  console.log("  average (success):", o.mindAvgTimeSucc.toFixed(3))
  console.log("  min              :", o.mindMinTime.toFixed(3))
  console.log("  max              :", o.mindMaxTime.toFixed(3))
  console.log("  med              :", o.mindMedTime.toFixed(3))
  console.log("requst count:")
  console.log("  all              :", o.reqCountAll)
  console.log("  success          :", o.reqCountSucc, `${(o.reqCountSucc / o.reqCountAll * 100).toFixed(1)}%`)
  console.log("  failed           :", reqCountFailed, `${(reqCountFailed / o.reqCountAll * 100).toFixed(1)}%`)
}

function median(numbers: number[]): number | undefined {
  if (numbers.length === 0) {
    console.error("Error: empty list median")
    return undefined;
  }

  const sorted = [...numbers].sort((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

function unOpt<T>(x: T | undefined | null): T {
  switch (x) {
    case undefined:
    case null:
      throw new Error("unexpected null/undefined")
    default:
      return x;
  }
}

// ----------------------------------------------------------------------------
// -- Exe

main().catch((err) => {
  console.error("Script failed:", err);
});
