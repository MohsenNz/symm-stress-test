// This is where 4-core nodes usually die.
import http from 'k6/http';
import { unOpt } from './util.js'

const url = unOpt(__ENV.RPC_URL);
const data = unOpt(__ENV.DATA);

export const options = {
  vus: 1000,
  duration: '120s',
};

export default function() {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{
      to: "0xFfa11031E564230772C969d6a15a0dDdE5889D9b", // contract address
      data: data
    }, "latest"],
    id: 1
  };

  http.post(url, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
