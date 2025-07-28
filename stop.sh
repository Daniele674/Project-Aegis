#!/bin/bash

echo "==> Fermata dello stack FireFly..."
if ff stop dev; then
  echo "✅ FireFly fermato con successo."
else
  echo "❌ Errore durante la fermata di FireFly. Interruzione dello script."
  exit 1
fi

echo "==> Fermata dei container Fabric..."
docker stop \
  $(docker ps -q --filter "name=peer0.org") \
  $(docker ps -q --filter "name=orderer.example.com") \
  $(docker ps -q --filter "name=ca_org") \
  $(docker ps -q --filter "name=ca_orderer") \
  $(docker ps -q --filter "name=dev-peer0.org")

echo "✅ Tutti i container specificati sono stati fermati."
