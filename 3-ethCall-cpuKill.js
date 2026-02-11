// This is where 4-core nodes usually die.
import http from 'k6/http';
import { unOpt } from './util.js'

const url = unOpt(__ENV.RPC_URL);
const tx = unOpt(__ENV.TX);

export const options = {
  vus: 1000,
  duration: '120s',
};

export default function() {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{
      to: "0xce1721B24459Ab45c3bA17Bf5C55A8D740956CBB", // contract address
      data: tx
    }, "latest"],
    id: 1
  };

  http.post(url, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
