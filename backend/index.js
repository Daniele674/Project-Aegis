const express = require('express');
const bodyParser = require('body-parser');
const FireFly = require('@hyperledger/firefly-sdk').default; // Importa FireFly come default export
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

function getFireflySDK(org) {
 if (org === "MSP1"){
     console.log("fireflysdk","msp1");
     return firefly = new FireFly({
        host: 'http://localhost:5000',
        namespace: 'default'
     });
 } else if (org === "MSP2"){
    console.log("fireflysdk","msp2");
    return firefly = new FireFly({
        host: 'http://localhost:5001',
        namespace: 'default'
    });
 } else {
   console.log("fireflysdk", "msp3");
   return firefly = new FireFly({
        host: 'http://localhost:5002',
        namespace: 'default'
   });
 }
 
};

/*
// Initialize FireFly SDK
const firefly = new FireFly({
    host: 'http://localhost:5000', // FireFly API endpoint
    namespace: 'default', // FireFly namespace
});
*/

// Route to add a log
app.post('/invoke/AddLog', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.invokeContractAPI(
            'security_logs_api', // Nome dell'API del contratto
            'CreateLog', // Percorso del metodo del contratto
            {
                input: req.body // Parametri della richiesta
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Errore durante l\'aggiunta del log:', error);
        res.status(500).json({ error: error.message });
    }
});

// // Route to get all logs
// app.post('/query/GetAllLogs', async (req, res) => {
//     try {
//         const response = await axios.post('http://127.0.0.1:5000/api/v1/namespaces/default/apis/logsave2/query/GetAllLogs', req.body);
//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Route to get all logs
app.post('/query/GetAllLogs', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.queryContractAPI(
            'security_logs_api', // Nome dell'API del contratto
            'GetAllLogs', // Percorso del metodo del contratto
            {
                params: req.body // Parametri della richiesta
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero dei log:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get a specific log
app.post('/query/GetLog', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.queryContractAPI(
            'security_logs_api', // Nome dell'API del contratto
            'ReadLog', // Percorso del metodo del contratto
            {
                params: req.body // Parametri della richiesta
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero del log specifico:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to upload and publish a log
app.post('/invoke/UploadAndPublishLog', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        // Upload the log data to FireFly
        const uploadResponse = await firefly.uploadData({
            value: req.body.log // Send the log data under the 'value' key
        });

        // Publish the uploaded data
        const publishResponse = await firefly.publishData(uploadResponse.id, {});

        // Get the CID from the publish response
        const cid = publishResponse.public;

        // Respond with the CID
        res.json({ cid });
    } catch (error) {
        console.error('Errore durante il caricamento e la pubblicazione del log:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to send a broadcast message
app.post('/node/BroadcastMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        // Send the broadcast message using FireFly
        const broadcastResponse = await firefly.sendBroadcast({
            header: {
                topics: [req.body.topics], // Topics for the broadcast message
                tag: req.body.tag
            },
            data: [
                {
                    value: req.body.message // The message to broadcast
                }
            ]
        });

        // Respond with the broadcast response
        res.json(broadcastResponse);
    } catch (error) {
        console.error('Errore durante l\'invio del messaggio in broadcast:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get the amounts of logs by severity
app.post('/query/CountBySeverity', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.queryContractAPI(
            'security_logs_api', // Nome dell'API del contratto
            'CountBySeverity', // Percorso del metodo del contratto
            {
                params: req.body // Parametri della richiesta
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero dei log:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get the amounts of logs by attack type
app.post('/query/CountByAttack', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.queryContractAPI(
            'security_logs_api', // Nome dell'API del contratto
            'CountByAttackType', // Percorso del metodo del contratto
            {
                params: req.body // Parametri della richiesta
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero dei log:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to delete a log
app.post('/invoke/DeleteLog', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.invokeContractAPI(
            'security_logs_api', // Nome dell'API del contratto
            'DeleteLog', // Percorso del metodo del contratto
            {
                input: req.body // Parametri della richiesta
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Errore durante l\'eliminazione del log:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to update a log
app.post('/invoke/UpdateLog', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.invokeContractAPI(
            'security_logs_api', // Nome dell'API del contratto
            'UpdateLog', // Percorso del metodo del contratto
            {
                input: req.body // Parametri della richiesta
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Errore durante l\'eliminazione del log:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get the logs in a certain time range
app.post('/query/TimeRange', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.queryContractAPI(
            'security_logs_api', // Nome dell'API del contratto
            'GetLogsByTimeRange', // Percorso del metodo del contratto
            {
                input: req.body // Parametri della richiesta
            }
        );
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero dei log:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get the node's did
app.get('/node/Status', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.getStatus();
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero del did:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to send a private message
app.post('/node/PrivateMessage', async (req, res) => {
    try {
        // Send the private message using FireFly
        const org = req.headers['x-org'];
        const firefly = getFireflySDK(org);
        const privateResponse = await firefly.sendPrivateMessage({
            header: {
                tag: req.body.tag,
                topics: [req.body.topics]
            },
            data: [
                {
                    value: req.body.log 
                }
            ],
            group:{
             members:[
              {identity: req.body.did}
              ],
            }
        });

        res.json(privateResponse);
    } catch (error) {
        console.error('Errore durante l\'invio del messaggio:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get the node's private msgs
app.get('/node/GetPrivateMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.getMessages({
        type:'private'
        });
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero dei messaggi privati:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get the node's 
app.get('/node/GetMsgData', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.getData(req.query.id);
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero del:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get broadcast msgs
app.get('/node/GetBroadcastMessage', async (req, res) => {
    const org = req.headers['x-org'];
    const firefly = getFireflySDK(org);
    try {
        const response = await firefly.getMessages({
        type:'broadcast'
        });
        res.json(response);
    } catch (error) {
        console.error('Errore durante il recupero dei messaggi privati:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
