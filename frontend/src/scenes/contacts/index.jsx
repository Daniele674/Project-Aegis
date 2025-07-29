import { Box, IconButton, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { OrgContext } from "../../components/OrgContext";
import DownloadIcon from '@mui/icons-material/Download';

const Logs = () => {
  const { org } = useContext(OrgContext);
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    axios.post('http://localhost:3001/query/GetAllLogs', {}, {
      headers: { 'x-org': org }
    }).then(response => {
      const data = response.data.map(log => ({
        id: log.id,
        submitter: log.submitter,
        timestamp: log.timestamp,
        source_ip: log.sourceIp,
        attack_type: log.attackType,
        severity: log.severity,
        description: log.description,
        attachmentHash: log.attachmentHash
      }));
      setRows(data);
    }).catch(error => {
      console.error("Errore nel caricamento dei log:", error);
      setRows([]);
    });
  }, [org]);

  /**
   * Gestisce il download di un allegato leggendo il nome del file dagli header.
   */
  const handleDownload = async (attachmentId, logId) => {
    console.log(`Avvio download per l'attachment ${attachmentId}`);
    try {
      const response = await axios.get(`http://localhost:3001/data/download/${attachmentId}`, {
        headers: { 'x-org': org },
        responseType: 'blob', 
      });

      // --- NUOVA LOGICA PER ESTRARRE IL NOME DEL FILE ---
      const contentDisposition = response.headers['content-disposition'];
      let filename = `attachment-${logId}`; // Nome di fallback
      if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch.length > 1) {
              filename = filenameMatch[1];
          }
      }
      console.log(`Nome del file da scaricare: ${filename}`);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Usa il nome del file estratto dall'header
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download fallito:", error);
      alert("Impossibile scaricare l'allegato. Controllare la console per i dettagli.");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "submitter", headerName: "Submitter", flex: 1 },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1,
      cellClassName: "name-column--cell",
      type: "dateTime",
      valueGetter: (value) => new Date(value)
    },
    { field: "source_ip", headerName: "Source IP", flex: 1 },
    { field: "attack_type", headerName: "Attack Type", flex: 1 },
    { field: "severity", headerName: "Severity", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "attachment",
      headerName: "Attachment",
      flex: 0.5,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        if (params.row.attachmentHash) {
          return (
            <IconButton
              onClick={() => handleDownload(params.row.attachmentHash, params.row.id)}
              color="secondary"
              aria-label="download attachment"
            >
              <DownloadIcon />
            </IconButton>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="LOGS" subtitle="List of Logs" />
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
        />
      </Box>
    </Box>
  );
};

export default Logs;
