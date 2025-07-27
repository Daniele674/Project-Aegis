// src/api.js
import axios from 'axios';

// URL del tuo backend Express
export const API_BASE = 'http://localhost:3001';

// Crea un'istanza Axios con baseURL e header comuni
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 5000, // scommenta se vuoi un timeout globale
});

// Endpoint definiti sul backend
export const endpoints = {
  // Invoke (transazioni)
  addLog:             '/invoke/AddLog',
  updateLog:          '/invoke/UpdateLog',
  deleteLog:          '/invoke/DeleteLog',
  uploadAndPublish:   '/invoke/UploadAndPublishLog',

  // Query (letture)
  getAllLogs:         '/query/GetAllLogs',
  getLog:             '/query/GetLog',
  countBySeverity:    '/query/CountBySeverity',
  countByAttackType:  '/query/CountByAttackType',
  timeRange:          '/query/TimeRange',

  // Node management
  nodeStatus:         '/node/Status',
  broadcastMessage:   '/node/BroadcastMessage',
  privateMessage:     '/node/PrivateMessage',
  getPrivateMessages: '/node/GetPrivateMessage',
  getBroadcastMsgs:   '/node/GetBroadcastMessage',
  getMsgData:         '/node/GetMsgData',
};

// Helper per includere sempre l’header x‑org
export const withOrg = (org) => ({
  headers: { 'x-org': org },
});
