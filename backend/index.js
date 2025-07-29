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

function getFireflySDK(org) {
  let cfg;
  if (org === 'MSP1') {
    cfg = { host: 'http://localhost:5000', namespace: 'default' };
  } else if (org === 'MSP2') {
    cfg = { host: 'http://localhost:5001', namespace: 'default' };
  } else {
    cfg = { host: 'http://localhost:5002', namespace: 'default' };
  }
  console.log(`🔥 Inizializzazione client FireFly per ${org}:`, cfg.host, cfg.namespace);
  return new FireFly(cfg);
}


// --- Endpoints per Invocare Transazioni Chaincode ---

app.post('/invoke/AddLog', upload.single('attachment'), async (req, res) => {
    console.log('\n--- Ricevuta richiesta POST /invoke/AddLog ---');
    const org = req.headers['x-org'];

    if (!org) {
        return res.status(400).json({ error: 'Header x-org mancante.' });
    }

    const ff = getFireflySDK(org);
    
    try {
        let attachmentHash = "";

        if (req.file) {
            const uploadedData = await ff.uploadDataBlob(
                req.file.buffer, { filename: req.file.originalname }
            );
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

        const result = await ff.invokeContractAPI(
            CHAINCODE_NAME, 'CreateLogWithAttachment', { input: logInput }
        );

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
  const ff = getFireflySDK(org);
  try {
    const result = await ff.invokeContractAPI(CHAINCODE_NAME, 'UpdateLog', { input: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/invoke/DeleteLog', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const result = await ff.invokeContractAPI(CHAINCODE_NAME, 'DeleteLog', { input: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- Endpoints per Query su Chaincode ---

app.post('/query/GetAllLogs', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetAllLogs', { params: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/GetLog', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'ReadLog', { params: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/CountBySeverity', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'CountBySeverity', { params: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/CountByAttackType', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'CountByAttackType', { params: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/GetLogHistory', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetLogHistory', { params: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/query/TimeRange', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetLogsByTimeRange', { input: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- Endpoint per Download di Dati ---

app.get('/data/download/:id', async (req, res) => {
    const org = req.headers['x-org'];
    const dataId = req.params.id;
    if (!org || !dataId) {
      return res.status(400).json({ error: 'Org e ID dati sono obbligatori.' });
    }
    try {
      const ff = getFireflySDK(org);
      const data = await ff.getData(dataId);
      if (!data || !data.blob) {
          throw new Error(`Nessun dato o blob trovato per l'ID: ${dataId}`);
      }
      const filename = data.blob.name || `attachment-${dataId}`;
      const blobStream = await ff.getDataBlob(dataId);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      blobStream.pipe(res);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
});


// --- Endpoint di Interazione con il Nodo FireFly ---

app.get('/node/Status', async (req, res) => {
    const org = req.headers['x-org'];
    const ff = getFireflySDK(org);
    try {
        const status = await ff.getStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/node/BroadcastMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const ff = getFireflySDK(org);
    try {
        // Se il tag non è fornito o è vuoto, usa un tag di default.
        const tag = req.body.tag || 'generic_message';

        const broadcastResponse = await ff.sendBroadcast({
            header: {
                topics: [req.body.topics],
                tag: tag // Usa la variabile 'tag' sicura
            },
            data: [{ value: req.body.message }]
        });
        res.json(broadcastResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/node/PrivateMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const ff = getFireflySDK(org);
    try {
        const privateResponse = await ff.sendPrivateMessage({
            header: {
                tag: req.body.tag,
                topics: [req.body.topics]
            },
            data: [{ value: req.body.log }],
            group: { members: [{ identity: req.body.did }] }
        });
        res.json(privateResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/node/GetPrivateMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const ff = getFireflySDK(org);
    try {
        const messages = await ff.getMessages({ type: 'private' });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/node/GetBroadcastMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const ff = getFireflySDK(org);
    try {
        const messages = await ff.getMessages({ type: 'broadcast' });
        res.json(messages);
    } catch (err) {
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
        res.status(500).json({ error: err.message });
    }
});


// --- Avvio del Server ---
app.listen(port, () => {
  console.log(`🚀 Backend server in esecuzione su http://localhost:${port}`);
});
