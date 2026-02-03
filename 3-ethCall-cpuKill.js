// This is where 4-core nodes usually die.
import http from 'k6/http';

const url = "https://symmchain-node1.muon.net";
// const url = "http://127.0.0.1:8449";

export const options = {
  vus: 1000,
  duration: '120s',
};

export default function() {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{
      to: "0xContract",
      data: "0x..."
    }, "latest"],
    id: 1
  };

  http.post(url, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
