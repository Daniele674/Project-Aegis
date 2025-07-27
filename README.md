# Project‑Aegis

**A decentralized threat intelligence platform built on Hyperledger Fabric and FireFly**

---

## 🛑 The Problem

Internet Service Providers (ISPs) are on the front lines of cyber defense, constantly mitigating attacks like DDoS, malware propagation, and phishing campaigns. However, they often operate in isolated defense silos. When one ISP detects and mitigates a new threat, this critical intelligence isn’t instantly and reliably shared with its peers. As a result, other ISPs must “rediscover” the same threat, leading to repeated and preventable damage across the global internet infrastructure.

---

## 🛡️ The Solution: A Collaborative Defense Ledger

Project‑Aegis solves this challenge by creating a consortium-based decentralized application where ISPs can establish a single source of truth for security threat data. By leveraging blockchain, the platform provides:

- **Immutability**  
  Once a security log is submitted to the ledger, it cannot be altered or deleted, ensuring data integrity.

- **Real‑time Transparency**  
  All consortium members see the same threat data the moment it’s published, enabling rapid, coordinated response.

- **Auditability**  
  Every submission is cryptographically signed and traceable to its originator, creating a non‑repudiable audit trail.

- **Decentralization**  
  The network operates without a central intermediary, fostering trust and resilience among participants.

> Hyperledger Fabric serves as the permissioned trust layer, while Hyperledger FireFly provides a powerful application layer with REST APIs, event-driven WebSocket notifications, and off‑chain data management.

---

## 🚀 Key Features

- ✅ **Immutable Log Registry**  
  A robust chaincode (Go) for creating, reading, and querying security logs.

- ✅ **Real‑time Event Notifications**  
  FireFly listeners and subscriptions push critical event updates to clients via WebSockets.

- ✅ **Off‑Chain Data Management**  
  Large evidence files (e.g., .pcap captures) stored in IPFS; only immutable hashes reside on‑chain.

- ✅ **Advanced On‑Chain Querying**  
  Composite keys enable efficient indexing (e.g., query all logs by severity).

- ✅ **Complete Audit Trail**  
  Retrieve the full transaction history of any log to demonstrate blockchain auditability.

---

## 📚 Technologies

- **Hyperledger Fabric** — Permissioned blockchain network  
- **Hyperledger FireFly** — Application layer (REST API & WebSocket)  
- **Go** — Chaincode development  
- **IPFS** — Off‑chain file storage  

---

## 🎯 Project Purpose

Developed as a university examination project on blockchain technologies, Project‑Aegis demonstrates a practical, real‑world application of Hyperledger Fabric and Hyperledger FireFly, showcasing the power of decentralized collaboration in threat intelligence.
