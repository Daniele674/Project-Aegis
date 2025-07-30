import { Box, useTheme, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { OrgContext } from "../../components/OrgContext";

const CustomNoRowsOverlay = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box height="100%" display="flex" alignItems="center" justifyContent="center" sx={{ color: colors.grey[300] }}>
            <Typography>Your inbox is empty.</Typography>
        </Box>
    );
};

const Messages = () => {
  const { org } = useContext(OrgContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    // Flag per tracciare se il componente è ancora "attivo"
    let isMounted = true; 

    const loadPrivateMsgs = async () => {
      console.log(`--- [useEffect Messages] Esecuzione per org: '${org}' ---`);
      if (!org) {
          console.log("[useEffect Messages] Org non definito, esco.");
          return;
      }
      setLoading(true);

      try {
        console.log(`[useEffect Messages] Chiamata API con header x-org: '${org}'`);
        
        const statusRes = await axios.get('http://localhost:3001/node/Status', {
            headers: { 'x-org': org }
        });
        const currentOrgDid = statusRes.data.org.did;

        const res = await axios.get('http://localhost:3001/node/GetPrivateMessage', {
          headers: { 'x-org': org }
        });
        
        // Interrompi se il componente non è più montato
        if (!isMounted) return;

        const receivedMessages = res.data.filter(item => item.header.author !== currentOrgDid);

        const messagePromises = receivedMessages.map(async (item) => {
          if (!item.data?.[0]?.id) return null;
          
          const msgDataRes = await axios.get('http://localhost:3001/node/GetMsgData', {
            headers: { 'x-org': org },
            params: { 'id': item.data[0].id }
          });
          
          if (!isMounted) return null;

          const messageContent = msgDataRes.data.value?.message || "[No message content]";

          return {
            id: item.header.id,
            author: item.header.author,
            timestamp: item.confirmed,
            tag: item.header.tag,
            topics: item.header.topics,
            message: messageContent,
          };
        });
        
        const data = (await Promise.all(messagePromises)).filter(Boolean);
        
        // Aggiorna lo stato solo se questo è ancora l'effetto "attivo"
        if (isMounted) {
            console.log(`[useEffect Messages] Dati finali per '${org}':`, data.length, "messaggi.");
            setRows(data);
        }
      } catch (error) {
        if (isMounted) {
            console.error("Errore nel caricamento dei messaggi privati:", error);
            setRows([]);
        }
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    };

    loadPrivateMsgs();

    // Funzione di cleanup: viene eseguita quando 'org' cambia, prima che parta il nuovo effetto.
    return () => {
      console.log(`--- [useEffect Messages] Cleanup per org: '${org}' ---`);
      isMounted = false;
    };
  }, [org]);

  const columns = [
    { 
      field: "timestamp", 
      headerName: "Received", 
      flex: 1, 
      cellClassName: "name-column--cell",
      valueFormatter: (value) => value ? new Date(value).toLocaleString('it-IT') : ''
    },
    { 
      field: "author", 
      headerName: "From", 
      flex: 1,
      valueGetter: (value) => value ? value.slice(value.lastIndexOf(':') + 1) : ''
    },
    { field: "message", headerName: "Message", flex: 2, cellClassName: "name-column--cell" },
    { field: "tag", headerName: "Tag", flex: 1 },
    { field: "topics", headerName: "Topics", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Header
        title="PRIVATE INBOX"
        subtitle={`List of Messages Received by ${org}`}
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          slots={{ 
            toolbar: GridToolbar,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          getRowId={(row) => row.id}
        />
      </Box>
    </Box>
  );
};

export default Messages;
