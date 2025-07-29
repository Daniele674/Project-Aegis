import { Box, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { OrgContext } from "../../components/OrgContext";

const Messages = () => {
  const { org } = useContext(OrgContext);
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const loadPrivateMsgs = async () => {
      if (!org) return; // Non fare nulla se l'organizzazione non è ancora stata impostata

      try {
        const res = await axios.get('http://localhost:3001/node/GetPrivateMessage', {
          headers: { 'x-org': org }
        });

        // Mappiamo ogni messaggio ricevuto per estrarre i dettagli
        const messagePromises = res.data.map(async (item) => {
          if (!item.data || !item.data[0] || !item.data[0].id) {
            console.warn("Messaggio senza dati validi, lo salto:", item);
            return null; // Salta i messaggi che non hanno un payload di dati
          }

          const msgDataRes = await axios.get('http://localhost:3001/node/GetMsgData', {
            headers: { 'x-org': org },
            params: { 'id': item.data[0].id }
          });
          
          // La nuova struttura del payload è { "message": "..." }
          const messageContent = msgDataRes.data.value?.message || "[No message content]";

          return {
            id: item.header.id,
            author: item.header.author, // L'identità di chi ha inviato
            timestamp: item.confirmed, // Il timestamp di conferma del messaggio
            tag: item.header.tag,
            topics: item.header.topics,
            message: messageContent, // Il testo del messaggio
          };
        });
        
        // Aspetta che tutte le richieste per i dati dei messaggi siano completate
        const data = (await Promise.all(messagePromises)).filter(Boolean); // .filter(Boolean) rimuove eventuali null
        console.log('Messaggi privati caricati:', data);
        setRows(data);
      } catch (error) {
        console.error("Errore nel caricamento dei messaggi privati:", error);
        setRows([]); // In caso di errore, svuota la tabella
      }
    };

    loadPrivateMsgs();
  }, [org]); // Riesegui quando cambia l'organizzazione

  // Colonne aggiornate per mostrare i dati del messaggio semplice
  const columns = [
    { 
      field: "timestamp", 
      headerName: "Timestamp", 
      flex: 1, 
      cellClassName: "name-column--cell",
      type: "dateTime",
      valueGetter: (value) => value ? new Date(value) : null
    },
    { 
      field: "author", 
      headerName: "Author", 
      flex: 1,
      // Puoi aggiungere un valueGetter per formattare il DID se è troppo lungo
      valueGetter: (value) => value ? value.slice(value.lastIndexOf(':') + 1) : ''
    },
    { 
      field: "message", 
      headerName: "Message", 
      flex: 2, // Diamo più spazio al messaggio
      cellClassName: "name-column--cell",
    },
    { 
      field: "tag", 
      headerName: "Tag", 
      flex: 1 
    },
    { 
      field: "topics", 
      headerName: "Topics", 
      flex: 1 
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="PRIVATE INBOX"
        subtitle="List of Received Private Messages"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          getRowId={(row) => row.id} // Specifica che il campo 'id' è l'ID univoco della riga
        />
      </Box>
    </Box>
  );
};

export default Messages;
