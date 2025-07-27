import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import {OrgContext} from "../../components/OrgContext";

const Messages2 = () => {
  const {org, setOrg} = useContext(OrgContext);
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
 
  useEffect(() => {
  
   const LoadPrivateMsgs = async () => {
    const res = await axios.get('http://localhost:3001/node/GetBroadcastMessage',{
  	  headers:{
  		  'x-org':org
  	  }
    });
    const req = res.data.map(async (item) => {
     console.log('item',item.data[0].id);
     const msg = await axios.get('http://localhost:3001/node/GetMsgData',{
     	headers:{
     		'x-org':org
     	},
     	params:{
     		'id':item.data[0].id
     	}
     });
    return {
	     author:item.header.key.slice(0,7),
	     message:msg.data.value,
	     tag:item.header.tag,
	     topics:item.header.topics,
	     id:item.header.id,
     };
    });
   console.log('req',req); 
   const data = await Promise.all(req);
   console.log('data',data);
   setRows(data);
   };
    
  LoadPrivateMsgs();
}, []);
	
    const columns = [
    { field: "author", headerName: "Author", flex: 1, headerAlign:"left", flex:1},
    {
      field: "message",
      headerName: "Message",
      flex: 1,
    },
    {
      field: "topics",
      headerName: "Topics",
      flex: 1,
    },
    {
      field: "tag",
      headerName: "Tag",
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="Broadcast Mail"
        subtitle="List of Broadcast Messages"
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

export default Messages2;
