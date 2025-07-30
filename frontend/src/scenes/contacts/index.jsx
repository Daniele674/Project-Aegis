import { 
    Box, 
    IconButton, 
    useTheme, 
    Typography, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tooltip
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { OrgContext } from "../../components/OrgContext";
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';

const Logs = () => {
  const { org } = useContext(OrgContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [historyData, setHistoryData] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  useEffect(() => {
    setLoading(true);
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
    }).finally(() => {
      setLoading(false);
    });
  }, [org]);

  const handleDownload = async (attachmentId, logId) => {
    try {
      const response = await axios.get(`http://localhost:3001/data/download/${attachmentId}`, {
        headers: { 'x-org': org },
        responseType: 'blob', 
      });
      const contentDisposition = response.headers['content-disposition'];
      let filename = `attachment-${logId}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.length > 1) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Impossibile scaricare l'allegato.");
    }
  };

  const handleShowHistory = async (logId) => {
    try {
      setSelectedLogId(logId);
      const response = await axios.post('http://localhost:3001/query/GetLogHistory', { id: logId }, {
        headers: { 'x-org': org }
      });
      setHistoryData(response.data || []);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error("Errore nel recupero della cronologia:", error);
      alert("Impossibile recuperare la cronologia del log.");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1.5 },
    { field: "submitter", headerName: "Submitter", flex: 0.8 },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1,
      cellClassName: "name-column--cell",
      valueFormatter: (value) => value ? new Date(value).toLocaleString('it-IT') : ''
    },
    { field: "source_ip", headerName: "Source IP", flex: 0.8 },
    { field: "attack_type", headerName: "Attack Type", flex: 1 },
    {
      field: "severity",
      headerName: "Severity",
      flex: 0.8,
      headerAlign: 'center',
      renderCell: ({ row: { severity } }) => (
        // Contenitore Flexbox per garantire il centraggio perfetto
        <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
            <Box width="90px" p="5px" textAlign="center" borderRadius="4px"
                backgroundColor={
                    (severity || '').toLowerCase() === 'critical' ? colors.redAccent[600] :
                    (severity || '').toLowerCase() === 'high' ? colors.redAccent[500] :
                    (severity || '').toLowerCase() === 'medium' ? colors.blueAccent[600] :
                    colors.greenAccent[700]
                }>
                <Typography color={colors.grey[100]} sx={{ textTransform: 'capitalize' }}>{severity}</Typography>
            </Box>
        </Box>
      )
    },
    { field: "description", headerName: "Description", flex: 1.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false, filterable: false, disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params) => (
        // Contenitore Flexbox per garantire il centraggio perfetto
        <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
            {params.row.attachmentHash && (
                <Tooltip title="Download Attachment">
                    <IconButton onClick={() => handleDownload(params.row.attachmentHash, params.row.id)}>
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>
            )}
            <Tooltip title="View Log History">
                <IconButton onClick={() => handleShowHistory(params.row.id)}>
                    <HistoryIcon />
                </IconButton>
            </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="ALL LOGS" subtitle="List of All Logs on the Network" />
      <Box m="40px 0 0 0" height="75vh" sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none", py: 1 },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
          "& .MuiIconButton-root:hover": { color: colors.greenAccent[300] }
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
        />
      </Box>

      {/* Finestra di Dialogo per la Cronologia */}
      <Dialog open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ backgroundColor: colors.blueAccent[700] }}>
          History for Log ID: {selectedLogId}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          <TableContainer component={Paper} sx={{ mt: 2, backgroundColor: colors.primary[500] }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.blueAccent[700], '& .MuiTableCell-root': { color: colors.grey[100], fontWeight: 'bold' } }}>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Attack Type</TableCell>
                  <TableCell>Source IP</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Transaction ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.map((record, index) => {
                  const prevRecord = historyData[index + 1]?.record;
                  const currentRecord = record.record;
                  
                  const HighlightedCell = ({ value, prevValue }) => (
                    <TableCell sx={{
                      color: colors.grey[100],
                      backgroundColor: prevValue && value !== prevValue ? colors.greenAccent[900] : 'transparent',
                      fontWeight: prevValue && value !== prevValue ? 'bold' : 'normal',
                    }}>
                      {value}
                    </TableCell>
                  );

                  return (
                    <TableRow key={record.txId} sx={{ '&:hover': { backgroundColor: colors.primary[400] } }}>
                      <TableCell sx={{ color: colors.grey[100] }}>{new Date(record.timestamp).toLocaleString('it-IT')}</TableCell>
                      <HighlightedCell value={currentRecord.attackType} prevValue={prevRecord?.attackType} />
                      <HighlightedCell value={currentRecord.sourceIp} prevValue={prevRecord?.sourceIp} />
                      <HighlightedCell value={currentRecord.severity} prevValue={prevRecord?.severity} />
                      <HighlightedCell value={currentRecord.description} prevValue={prevRecord?.description} />
                      <Tooltip title={record.txId}>
                        <TableCell sx={{ color: colors.grey[300], fontFamily: 'monospace', fontSize: '12px' }}>
                            {record.txId.substring(0, 12)}...
                        </TableCell>
                      </Tooltip>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.blueAccent[700] }}>
          <Button onClick={() => setIsHistoryOpen(false)} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Logs;
