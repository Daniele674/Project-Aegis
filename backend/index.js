const express = require('express');
const bodyParser = require('body-parser');
const FireFly = require('@hyperledger/firefly-sdk').default;
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

function getFireflySDK(org) {
  let cfg;
  if (org === 'MSP1') {
    cfg = { host: 'http://localhost:5000', namespace: 'default' };
  } else if (org === 'MSP2') {
    cfg = { host: 'http://localhost:5001', namespace: 'default' };
  } else {
    cfg = { host: 'http://localhost:5002', namespace: 'default' };
  }
  console.log(`🔥 FireFly client per ${org}:`, cfg.host, cfg.namespace);
  return new FireFly(cfg);
}

// --- Endpoints Invoke ---

app.post('/invoke/AddLog', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('AddLog input:', req.body);
    const result = await ff.invokeContractAPI(
      'mycc_api',
      'CreateLog',
      { input: req.body }
    );
    res.json(result);
  } catch (err) {
    console.error('Errore AddLog:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/invoke/UpdateLog', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('UpdateLog input:', req.body);
    const result = await ff.invokeContractAPI(
      'mycc_api',
      'UpdateLog',
      { input: req.body }
    );
    res.json(result);
  } catch (err) {
    console.error('Errore UpdateLog:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/invoke/DeleteLog', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('DeleteLog input:', req.body);
    const result = await ff.invokeContractAPI(
      'mycc_api',
      'DeleteLog',
      { input: req.body }
    );
    res.json(result);
  } catch (err) {
    console.error('Errore DeleteLog:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

// --- Endpoints Query ---

app.post('/query/GetAllLogs', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('GetAllLogs params:', req.body);
    const result = await ff.queryContractAPI(
      'mycc_api',
      'GetAllLogs',
      { params: req.body }
    );
    res.json(result);
  } catch (err) {
    console.error('Errore GetAllLogs:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/GetLog', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('GetLog params:', req.body);
    const result = await ff.queryContractAPI(
      'mycc_api',
      'ReadLog',
      { params: req.body }
    );
    res.json(result);
  } catch (err) {
    console.error('Errore GetLog:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/CountBySeverity', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('CountBySeverity params:', req.body);
    const result = await ff.queryContractAPI(
      'mycc_api',
      'CountBySeverity',
      { params: req.body }
    );
    res.json(result);
  } catch (err) {
    console.error('Errore CountBySeverity:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/CountByAttackType', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('CountByAttackType params:', req.body);
    const result = await ff.queryContractAPI(
      'mycc_api',
      'CountByAttackType',
      { params: req.body }
    );
    res.json(result);
  } catch (err) {
    console.error('Errore CountByAttackType:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/TimeRange', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('TimeRange input:', req.body);
    const result = await ff.queryContractAPI(
      'mycc_api',
      'GetLogsByTimeRange',
      { input: req.body }   // use input for positional args
    );
    res.json(result);
  } catch (err) {
    console.error('Errore TimeRange:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

// --- Upload / Publish / Broadcast ---

app.post('/invoke/UploadAndPublishLog', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const upload = await ff.uploadData({ value: req.body.log });
    const publish = await ff.publishData(upload.id, {});
    res.json({ cid: publish.public });
  } catch (err) {
    console.error('Errore UploadAndPublishLog:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/node/BroadcastMessage', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const bc = await ff.sendBroadcast({
      header: { topics: [req.body.topics], tag: req.body.tag },
      data: [{ value: req.body.message }]
    });
    res.json(bc);
  } catch (err) {
    console.error('Errore BroadcastMessage:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

// --- Node endpoints ---

app.get('/node/Status', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const status = await ff.getStatus();
    res.json(status);
  } catch (err) {
    console.error('Errore Node Status:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/node/PrivateMessage', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const pm = await ff.sendPrivateMessage({
      header: { tag: req.body.tag, topics: [req.body.topics] },
      data: [{ value: req.body.log }],
      group: { members: [{ identity: req.body.did }] }
    });
    res.json(pm);
  } catch (err) {
    console.error('Errore PrivateMessage:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/node/GetPrivateMessage', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const msgs = await ff.getMessages({ type: 'private' });
    res.json(msgs);
  } catch (err) {
    console.error('Errore GetPrivateMessage:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/node/GetBroadcastMessage', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const msgs = await ff.getMessages({ type: 'broadcast' });
    res.json(msgs);
  } catch (err) {
    console.error('Errore GetBroadcastMessage:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/node/GetMsgData', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const data = await ff.getData(req.query.id);
    res.json(data);
  } catch (err) {
    console.error('Errore GetMsgData:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
