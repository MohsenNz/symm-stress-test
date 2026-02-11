#!/bin/bash

#                                                            cpu    ,storage
cast mktx 0xce1721B24459Ab45c3bA17Bf5C55A8D740956CBB "stress(uint256,uint256)" 10000 50 \
    --private-key "$PK" \
    --rpc-url "$RPC_URL"
