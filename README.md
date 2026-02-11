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
k6 run 3-ethCall-cpuKill.js --summary-mode full -e RPC_URL=$RPC_URL TX=$(./mktx-ethCall-cpuKill.bash)
```

## For write calls (needed sign)

Get get signed tx from `cast` and use it wit k6. (becase k6 can't sign tx)

`3-ethCall-cpuKill` test:

```bash
cast mktx 0xce1721B24459Ab45c3bA17Bf5C55A8D740956CBB "stress(uint256,uint256)" 1 0 \
  --private-key $PK --rpc-url http://127.0.0.1:8449
```

Then copy raw hex and use it in `3-ethCall-cpuKill.js`, at `data` parameter.
