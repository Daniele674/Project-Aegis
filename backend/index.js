const express = require('express');
const FireFly = require('@hyperledger/firefly-sdk').default;
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 3001;
const CHAINCODE_NAME = 'mycc_api2';

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Funzione di selezione del nodo ---
function getFireflySDK(org) {
  const normalizedOrg = (org || '').trim().toUpperCase();
  let host;
  if (normalizedOrg === 'ORG1MSP') host = 'http://localhost:5000';
  else if (normalizedOrg === 'ORG2MSP') host = 'http://localhost:5001';
  else if (normalizedOrg === 'ORG3MSP') host = 'http://localhost:5002';
  else {
    console.error(`!!! ORG NON RICONOSCIUTA: '${org}'. Fallback al nodo di default (5000). !!!`);
    host = 'http://localhost:5000';
  }
  console.log(`>>> Connessione al nodo FireFly su host: ${host}`);
  return { ff: new FireFly({ host, namespace: 'default' }), host };
}


// --- Endpoints per Invocare Transazioni Chaincode ---

app.post('/invoke/AddLog', upload.single('attachment'), async (req, res) => {
    const org = req.headers['x-org'];
    if (!org) return res.status(400).json({ error: 'Header x-org mancante.' });
    const { ff } = getFireflySDK(org);
    try {
        let attachmentHash = "";
        if (req.file) {
            const uploadedData = await ff.uploadDataBlob(req.file.buffer, { filename: req.file.originalname });
            attachmentHash = uploadedData.id;
            await ff.publishDataBlob(attachmentHash);
        }
        const logInput = {
            attackType: req.body.attackType || "",
            sourceIP: req.body.sourceIP || "",
            severity: req.body.severity || "",
            description: req.body.description || "",
            attachmentHash: attachmentHash,
        };
        if (!logInput.attackType || !logInput.sourceIP || !logInput.severity) {
            return res.status(400).json({ error: 'Validazione fallita: campi obbligatori mancanti.' });
        }
        const result = await ff.invokeContractAPI(CHAINCODE_NAME, 'CreateLogWithAttachment', { input: logInput });
        const broadcastMessage = {
            header: { tag: 'new_log_created' },
            data: [ { value: logInput } ]
        };
        if (attachmentHash) {
            broadcastMessage.data.push({ id: attachmentHash });
        }
        await ff.sendBroadcast(broadcastMessage);
        res.status(201).json(result);
    } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Errore sconosciuto.';
        res.status(500).json({ error: errorMessage });
    }
});

app.post('/invoke/UpdateLog', async (req, res) => {
  const org = req.headers['x-org'];
  const { ff } = getFireflySDK(org);
  try {
    const result = await ff.invokeContractAPI(CHAINCODE_NAME, 'UpdateLog', { input: req.body });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/invoke/DeleteLog', async (req, res) => {
  const org = req.headers['x-org'];
  const { ff } = getFireflySDK(org);
  try {
    const result = await ff.invokeContractAPI(CHAINCODE_NAME, 'DeleteLog', { input: req.body });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- NUOVO ENDPOINT PER AGGIUNGERE UN ALLEGATO ---
app.post('/invoke/AddAttachmentToLog', upload.single('attachment'), async (req, res) => {
    console.log('\n--- Ricevuta richiesta a /invoke/AddAttachmentToLog ---');
    const org = req.headers['x-org'];
    const { logId } = req.body;

    if (!org || !logId || !req.file) {
        return res.status(400).json({ error: 'Header x-org, logId, e un file allegato sono obbligatori.' });
    }
    const { ff } = getFireflySDK(org);

    try {
        // 1. Carica e pubblica il nuovo file allegato
        console.log(`Caricamento del nuovo allegato '${req.file.originalname}'...`);
        const uploadedData = await ff.uploadDataBlob(req.file.buffer, { filename: req.file.originalname });
        const attachmentHash = uploadedData.id;
        await ff.publishDataBlob(attachmentHash);
        console.log(`Nuovo allegato pubblicato con ID: ${attachmentHash}`);

        // 2. Prepara l'input e chiama il chaincode per associare l'hash al log
        const input = { id: logId, attachmentHash };
        const result = await ff.invokeContractAPI(CHAINCODE_NAME, 'AddAttachmentToLog', { input });

        // 3. Invia una notifica broadcast dell'aggiornamento
        await ff.sendBroadcast({
            header: { tag: 'log_attachment_added' },
            data: [
                { value: { logId, newAttachmentId: attachmentHash } },
                { id: attachmentHash }
            ]
        });

        res.status(200).json(result);
    } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Errore sconosciuto.';
        console.error("Errore in AddAttachmentToLog:", errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});


// --- Endpoints per Query su Chaincode ---
// ... (Tutti gli endpoint di query rimangono invariati)
app.post('/query/GetAllLogs', async (req, res) => {
  const org = req.headers['x-org'];
  const { ff } = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetAllLogs', { params: req.body });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/query/GetLog', async (req, res) => {
  const org = req.headers['x-org'];
  const { ff } = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'ReadLog', { params: req.body });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/query/CountBySeverity', async (req, res) => {
  const org = req.headers['x-org'];
  const { ff } = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'CountBySeverity', { params: req.body });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/query/CountByAttackType', async (req, res) => {
  const org = req.headers['x-org'];
  const { ff } = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'CountByAttackType', { params: req.body });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/query/GetLogHistory', async (req, res) => {
  const org = req.headers['x-org'];
  const { ff } = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetLogHistory', { input: req.body });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/query/TimeRange', async (req, res) => {
  const org = req.headers['x-org'];
  const { ff } = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetLogsByTimeRange', { input: req.body });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/query/GetLogsBySeverity', async (req, res) => {
    const org = req.headers['x-org'];
    const { ff } = getFireflySDK(org);
    try {
        const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetLogsBySeverity', { input: req.body });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/query/GetLogsWithAttachments', async (req, res) => {
    const org = req.headers['x-org'];
    const { ff } = getFireflySDK(org);
    try {
        const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetLogsWithAttachments', { params: req.body });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/query/GetLogsBySubmitter', async (req, res) => {
    const org = req.headers['x-org'];
    const { ff } = getFireflySDK(org);
    try {
        const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetLogsBySubmitter', { input: req.body });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Endpoint per Download di Dati ---
app.get('/data/download/:id', async (req, res) => {
    const org = req.headers['x-org'];
    const dataId = req.params.id;
    if (!org || !dataId) return res.status(400).json({ error: 'Org e ID dati sono obbligatori.' });
    try {
      const { ff } = getFireflySDK(org);
      const data = await ff.getData(dataId);
      if (!data || !data.blob) throw new Error(`Nessun dato o blob trovato per l'ID: ${dataId}`);
      const filename = data.blob.name || `attachment-${dataId}`;
      const blobStream = await ff.getDataBlob(dataId);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      blobStream.pipe(res);
    } catch (err) { res.status(404).json({ error: err.message }); }
});


// --- Endpoint di Interazione con il Nodo FireFly ---
app.get('/node/Status', async (req, res) => {
    const org = req.headers['x-org'];
    const { ff } = getFireflySDK(org);
    try {
        const status = await ff.getStatus();
        res.json(status);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/node/BroadcastMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const { ff } = getFireflySDK(org);
    try {
        const tag = req.body.tag || 'generic_message';
        const broadcastResponse = await ff.sendBroadcast({
            header: { topics: [req.body.topics], tag: tag },
            data: [{ value: req.body.message }]
        });
        res.json(broadcastResponse);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/node/PrivateMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const { ff } = getFireflySDK(org);
    try {
        const privateResponse = await ff.sendPrivateMessage({
            header: { tag: req.body.tag, topics: [req.body.topics] },
            data: [{ value: req.body.log }],
            group: { members: [{ identity: req.body.did }] }
        });
        res.json(privateResponse);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/node/GetPrivateMessage', async (req, res) => {
    const { ff } = getFireflySDK(req.headers['x-org']);
    try {
        const messages = await ff.getMessages({ type: 'private' });
        res.json(messages);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/node/GetBroadcastMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const { ff } = getFireflySDK(org);
    try {
        const messages = await ff.getMessages({ type: 'broadcast' });
        res.json(messages);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/node/GetMsgData', async (req, res) => {
    const org = req.headers['x-org'];
    const { ff } = getFireflySDK(org);
    try {
        const data = await ff.getData(req.query.id);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- Avvio del Server ---
app.listen(port, () => {
  console.log(`🚀 Backend server in esecuzione su http://localhost:${port}`);
});
