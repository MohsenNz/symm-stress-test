# Run a test

```bash
k6 run <test-name> --summary-mode full -e RPC_URL=https://symmchain-node1.muon.net
```

or (to overwrite vus and duration):

```bash
k6 run --vus 500 --duration 120s <test-name> --summary-mode full -e RPC_URL=https://symmchain-node1.muon.net
```

`--vus` : virtual users

## For 3-ethCall-cpuKill

```bash
k6 run 3-ethCall-cpuKill.js --summary-mode full \
  -e RPC_URL=https://symmchain-node1.muon.net \
  -e DATA=$(cast calldata "stress(uint256)" 20000)
```
