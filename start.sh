#!/bin/bash

set -e

echo "==> Avvio dei container Fabric..."
docker start \
  $(docker ps -aq --filter "name=peer0.org") \
  $(docker ps -aq --filter "name=orderer.example.com") \
  $(docker ps -aq --filter "name=ca_org") \
  $(docker ps -aq --filter "name=ca_orderer") \
  $(docker ps -aq --filter "name=dev-peer0.org")

echo "==> Attendo che i container siano attivi..."

# Funzione che verifica che tutti i container necessari siano "Up"
wait_for_containers() {
  local timeout=30
  local elapsed=0

  while [ $elapsed -lt $timeout ]; do
    up_count=$(docker ps --filter "name=peer0.org" --filter "name=orderer.example.com" \
                         --filter "name=ca_org" --filter "name=ca_orderer" \
                         --filter "name=dev-peer0.org" --filter "status=running" -q | wc -l)

    if [ "$up_count" -ge 5 ]; then
      echo "✅ Tutti i container richiesti sono attivi."
      return 0
    fi

    sleep 2
    elapsed=$((elapsed + 2))
    echo "  ...attesa ($elapsed s)"
  done

  echo "❌ Timeout: alcuni container non si sono avviati correttamente."
  exit 1
}

wait_for_containers

echo "==> Avvio dello stack FireFly..."
ff start dev

echo "✅ Rete Fabric e stack FireFly avviati con successo."
