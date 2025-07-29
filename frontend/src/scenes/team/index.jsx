import { Box, useTheme, Snackbar, IconButton, Typography, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import { OrgContext } from "../../components/OrgContext";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const CustomNoRowsOverlay = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box height="100%" display="flex" alignItems="center" justifyContent="center" sx={{ color: colors.grey[300] }}>
            <Typography>No logs found for this organization.</Typography>
        </Box>
    );
};

const Team = () => {
  const theme = useTheme();
  const history = useNavigate();
  const { org } = useContext(OrgContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [alertData, setAlertData] = useState({
    severity: 'success', title: 'Success', message: 'Your log has been deleted!'
  });

  const getAllLogs = async () => {
    if (!org) return;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/query/GetAllLogs', {}, { headers: { 'x-org': org } });
      const allLogs = response.data.map(log => ({
        id: log.id,
        submitter: log.submitter,
        timestamp: log.timestamp,
        source_ip: log.sourceIp,
        attack_type: log.attackType,
        severity: log.severity,
        description: log.description,
      }));
      const filteredLogs = allLogs.filter(log => log.submitter === org);
      setRows(filteredLogs);
    } catch (error) {
      console.error(`Error fetching logs for ${org}:`, error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllLogs();
  }, [org]); 

  const deleteLog = async (id) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
        try {
            await axios.post('http://localhost:3001/invoke/DeleteLog', { id }, { headers: { 'x-org': org } });
            setAlertData({ severity: 'success', title: 'Success', message: 'The log has been deleted!' });
            setOpen(true);
            getAllLogs();
        } catch (error) {
            console.error('Error deleting log:', error);
            setAlertData({ severity: 'error', title: 'Error', message: 'An error has occurred!' });
            setOpen(true);
        }
    }
  };

  const handleClose = () => { setOpen(false); };

  const columns = [
    { field: "id", headerName: "ID", flex: 1.5 },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1,
      cellClassName: "name-column--cell",
      // Formattazione per corrispondere allo screenshot: GG/MM/AAAA, HH:MM:SS
      valueFormatter: (value) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleString('it-IT', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
      }
    },
    { field: "source_ip", headerName: "Source IP", flex: 0.8 },
    { field: "attack_type", headerName: "Attack Type", flex: 1 },
    {
      field: "severity",
      headerName: "Severity",
      flex: 0.8,
      headerAlign: 'center',
      // Applica la classe di allineamento personalizzata
      cellClassName: 'center-aligned-cell',
      renderCell: ({ row: { severity } }) => {
        const severityLower = (severity || '').toLowerCase();
        return (
          <Box
            width="90px" // Larghezza fissa per coerenza
            p="5px"
            textAlign="center"
            backgroundColor={
              severityLower === 'critical' ? colors.redAccent[600] :
              severityLower === 'high' ? colors.redAccent[500] :
              severityLower === 'medium' ? colors.blueAccent[600] :
              colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            <Typography color={colors.grey[100]} sx={{ textTransform: 'capitalize' }}>
              {severity}
            </Typography>
          </Box>
        );
      },
    },
    { field: "description", headerName: "Description", flex: 1.2 },
    {
      field: "manage",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      // Applica la classe di allineamento personalizzata
      cellClassName: 'center-aligned-cell',
      renderCell: ({ row }) => {
        return (
          // Ora non serve un Box esterno per centrare, lo fa la cella
          <>
            <Tooltip title="Update Log">
              <IconButton onClick={() => history("/update", { state: { log: row } })}>
                <EditOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Log">
              <IconButton onClick={() => deleteLog(row.id)} sx={{ color: colors.redAccent[500] }}>
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
          </>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="MANAGE MY LOGS" subtitle={`Managing Logs submitted by ${org}`} />
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
            "& .MuiIconButton-root:hover": { color: colors.greenAccent[300] },
            // --- CLASSE PERSONALIZZATA PER IL CENTRAGGIO PERFETTO ---
            "& .center-aligned-cell": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }
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
        />
      </Box>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={alertData.severity} sx={{ width: '100%' }}>
          <AlertTitle>{alertData.title}</AlertTitle>
          {alertData.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Team;
