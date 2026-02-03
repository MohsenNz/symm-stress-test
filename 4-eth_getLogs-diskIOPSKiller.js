// This can lock your node for minutes
import http from 'k6/http';

const url = "https://symmchain-node1.muon.net";
// const url = "http://127.0.0.1:8449";

export const options = {
  vus: 50,
  duration: '60s',
};

export default function() {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_getLogs",
    params: [{
      fromBlock: "0x0",
      toBlock: "0x662" // 1634
    }],
    id: 1
  };

  http.post(url, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
