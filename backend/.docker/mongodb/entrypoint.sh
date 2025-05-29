#!/bin/bash

mongod --port "$MONGO_REPLICA_PORT" --replSet rs0 --bind_ip 0.0.0.0 &

MONGOD_PID=$!

INIT_REPL_CMD="rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '${MONGO_REPLICA_HOST}:${MONGO_REPLICA_PORT}' }] })"

until mongosh --port $MONGO_REPLICA_PORT --quiet --eval "$INIT_REPL_CMD"; do
  echo "Aguardando MongoDB iniciar para configurar o replica set..."
  sleep 1
done

echo "REPLICA SET ONLINE"

wait $MONGOD_PID
