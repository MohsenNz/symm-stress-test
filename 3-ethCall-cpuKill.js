// This is where 4-core nodes usually die.
import http from 'k6/http';
import { unOpt } from './util.js'

const url = unOpt(__ENV.RPC_URL);

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
      data: "0x02f8af8305f7d0819201840bebc201825a3294ce1721b24459ab45c3ba17bf5c55a8d740956cbb80b844989e205a00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000c001a0518c69c98921d07e0e42b18f2e9750b39292192a3c55514031b562021575dd48a00e8b211fa0b503e5ae13116e076b83e36b83866f48cfa62c9e9b2c3482c8e85c" // TODO
    }, "latest"],
    id: 1
  };

  http.post(url, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
