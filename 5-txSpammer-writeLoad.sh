for i in {1..10000}; do
  cast send --rpc-url http://127.0.0.1:8545 \
    --private-key $PK \
    0xContract "foo(uint256)" $i &
done
