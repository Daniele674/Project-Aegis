import { Box, useTheme, Button, Snackbar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from 'axios';
import React, {useState, useEffect, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import {OrgContext} from "../../components/OrgContext";

const Team = () => {
  const theme = useTheme();
  const history= useNavigate();
  const {org, setOrg} = useContext(OrgContext);
  const [rows, setRows] = useState([]);
  const colors = tokens(theme.palette.mode);
  const [open, setOpen]= useState(false);
  const [alertData, setAlertData] = useState({
   severity: 'success', title:'Success', message:'Your log has been deleted!'
  });
  
  const GetAllLogs = async () =>{
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
  };
  
  useEffect(() => {
  GetAllLogs();
}, []);
  
  const DeleteLog = async(id) =>{
	try{
	console.log("sending log id:",id);
	const response = await axios.post('http://localhost:3001/invoke/DeleteLog',id,{
		headers:{
			'x-org':org
		}
	});
	console.log('log deleted successfully:',response.data);
	//alert('Log delete successfully');
	setOpen(true);
	} catch (error){
	console.error('error deleting',error);
	//alert('error deleting the log');
	setAlertData({
	 severity:'error', title:'Error', message:'An error has occured!'
	});
	setOpen(true);
	}
};
  
   const handleClose= () =>{
  setOpen(false);
  };
  
  const columns = [
    { field: "id", headerName: "ID" , headerAlign:"left", flex:1},
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1,
      cellClassName: "name-column--cell",
      type:"dateTime",
      valueGetter: (value) => new Date(value)
    },
    {
      field: "source_ip",
      headerName: "Source IP",
      headerAlign: "left",
      flex:1
    },
    {
      field: "attack_type",
      headerName: "Attack Type",
      flex: 1,
    },
    {
      field: "manage",
      headerName: "Manage",
      flex: 1,
      renderCell: ({row: row,id} ) => {
        return (
          <Box
            alignItems="center"
            width="60%"
            m="auto"
            mt="3.5px"
            p="5px"
            display="flex"
            justifyContent="center"
            borderRadius="4px"
          >
            
            <Button type="button" color="secondary" variant="contained" style={{marginRight:"5px"}} onClick={() => history("/update",{state:{log:row}})}>
            Update
            </Button>
            
            <Button type="button" color="secondary" variant="contained" onClick={async () => {const delay = ms => new Promise(res => setTimeout(res,ms));await DeleteLog({id}); await delay(2500); await GetAllLogs();}}>
            Delete
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="LOGS" subtitle="Managing the Logs" />
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
        }}
      >
        <DataGrid checkboxSelection rows={rows} columns={columns} disableRowSelectionOnClick />
      </Box>
      <Snackbar open={open} autoHideDuration="2000" onClose={handleClose} anchorOrigin={{vertical:'top', horizontal:'center'}}>
       <Alert onClose={handleClose} severity={alertData.severity} sx={{width: '100%'}}>
        <AlertTitle>{alertData.title}</AlertTitle>
        {alertData.message}
       </Alert>
      </Snackbar>
    </Box>
  );
};

export default Team;
