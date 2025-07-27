import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import {OrgContext} from "../../components/OrgContext";

const Logs = () => {
  const {org, setOrg} = useContext(OrgContext);
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);  
  useEffect(() => {
  axios.post('http://localhost:3001/query/GetAllLogs',{},{
  	headers:{
  		'x-org':org
  	}
  }).then(response => {
  	const data = response.data.map(log => ({
  		id: log.id,
  		submitter:log.submitter,
  		timestamp:log.timestamp,
  		source_ip:log.sourceIp,
  		attack_type:log.attackType,
  		severity:log.severity,
  		description:log.description
  		}));
  		console.log('log',data);
  		setRows(data);
  });
}, []);
	
    const columns = [
    { field: "id", headerName: "ID", flex: 1, headerAlign:"left", flex:1},
    { field: "submitter", headerName: "Submitter", flex:1},
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1,
      cellClassName: "name-column--cell",
      type: "dateTime",
      valueGetter: (value) => new Date(value)
    },
    {
      field: "source_ip",
      headerName: "Source IP",
      headerAlign: "left",
      align: "left",
      flex:1
    },
    {
      field: "attack_type",
      headerName: "Attack Type",
      flex: 1,
    },
    {
      field: "severity",
      headerName: "Severity",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="LOGS"
        subtitle="List of Logs"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
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
