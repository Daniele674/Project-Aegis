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


// --- Endpoints per Invocare Transazioni ---

app.post('/invoke/AddLog', upload.single('attachment'), async (req, res) => {
    console.log('\n--- Ricevuta richiesta POST /invoke/AddLog ---');
    const org = req.headers['x-org'];

    console.log('Header (x-org):', org);
    console.log('Campi di testo ricevuti (req.body):', req.body);
    console.log('File ricevuto (req.file):', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        size: req.file.size
    } : 'Nessun file caricato');

    if (!org) {
        console.error('Errore critico: Header x-org mancante.');
        return res.status(400).json({ error: 'Header x-org mancante. Impossibile procedere.' });
    }

    const ff = getFireflySDK(org);
    
    try {
        let attachmentHash = "";

        if (req.file) {
            // PASSO 1: Caricamento del blob
            console.log(`Caricamento dell'allegato '${req.file.originalname}' su FireFly usando uploadDataBlob...`);
            const uploadedData = await ff.uploadDataBlob(
                req.file.buffer,
                { filename: req.file.originalname }
            );
            attachmentHash = uploadedData.id;
            console.log(`Allegato caricato con successo. ID Dati FireFly: ${attachmentHash}`);

            // --- NUOVO PASSO: PUBBLICAZIONE DEL BLOB ---
            console.log(`Pubblicazione del blob ${attachmentHash} sullo storage condiviso...`);
            await ff.publishDataBlob(attachmentHash);
            console.log(`Blob ${attachmentHash} pubblicato con successo.`);
        }

        const logInput = {
            attackType: req.body.attackType || "",
            sourceIP: req.body.sourceIP || "",
            severity: req.body.severity || "",
            description: req.body.description || "",
            attachmentHash: attachmentHash, // L'ID è ora un riferimento a un dato pubblico
        };
        
        console.log('Input preparato per il chaincode "CreateLogWithAttachment":', logInput);

        if (!logInput.attackType || !logInput.sourceIP || !logInput.severity) {
            const errorMessage = 'Validazione fallita sul backend: i campi attackType, sourceIP, e severity sono obbligatori.';
            console.error(errorMessage);
            return res.status(400).json({ error: errorMessage });
        }

        const result = await ff.invokeContractAPI(
            CHAINCODE_NAME,
            'CreateLogWithAttachment',
            { input: logInput }
        );

        console.log('Chaincode invocato con successo!');
        res.status(201).json(result);

    } catch (err) {
        console.error('--- ERRORE DURANTE L\'ESECUZIONE DI /invoke/AddLog ---');
        const errorMessage = err.response?.data?.error || err.message || 'Si è verificato un errore sconosciuto.';
        console.error('Messaggio Errore Dettagliato:', errorMessage);
        console.error('Stack Errore:', err.stack || 'Nessuno stack disponibile.');
        res.status(500).json({ error: errorMessage });
    }
});


app.post('/invoke/UpdateLog', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    console.log('UpdateLog input:', req.body);
    const result = await ff.invokeContractAPI(CHAINCODE_NAME, 'UpdateLog', { input: req.body });
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
    const result = await ff.invokeContractAPI(CHAINCODE_NAME, 'DeleteLog', { input: req.body });
    res.json(result);
  } catch (err) {
    console.error('Errore DeleteLog:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});


// --- Endpoints per Eseguire Query ---

app.post('/query/GetAllLogs', async (req, res) => {
  const org = req.headers['x-org'];
  const ff = getFireflySDK(org);
  try {
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'GetAllLogs', { params: req.body });
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
    const result = await ff.queryContractAPI(CHAINCODE_NAME, 'ReadLog', { params: req.body });
    res.json(result);
  } catch (err) {
    console.error('Errore ReadLog:', err.stack || err);
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
    console.error('Errore CountBySeverity:', err.stack || err);
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
    console.error('Errore CountByAttackType:', err.stack || err);
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
    console.error('Errore GetLogHistory:', err.stack || err);
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
    console.error('Errore GetLogsByTimeRange:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});


// --- Endpoint per il Download di Dati ---

app.get('/data/download/:id', async (req, res) => {
    const org = req.headers['x-org'];
    const dataId = req.params.id;
  
    console.log(`\n--- Ricevuta richiesta GET /data/download/${dataId} per l'org ${org} ---`);
  
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
      console.log(`Nome del file originale trovato: ${filename}`);

      const blobStream = await ff.getDataBlob(dataId);
      console.log(`Stream del blob per ${dataId} ottenuto. Invio al client con il nome corretto...`);
  
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      blobStream.pipe(res);
  
      blobStream.on('end', () => {
        console.log('Download completato con successo.');
      });
  
    } catch (err) {
      console.error(`--- ERRORE DURANTE IL DOWNLOAD del blob ${dataId} ---`);
      const errorMessage = err.response?.data?.error || err.message || 'Blob non trovato o errore sconosciuto.';
      console.error('Messaggio Errore:', errorMessage);
      res.status(404).json({ error: errorMessage });
    }
});


// --- Avvio del Server ---
app.listen(port, () => {
  console.log(`🚀 Backend server in esecuzione su http://localhost:${port}`);
});
