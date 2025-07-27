import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import PieChart from "../../components/PieChart";
import DescriptionIcon from "@mui/icons-material/Description";
import React, {useEffect, useState, useContext} from 'react';
import axios from 'axios';
import {OrgContext} from '../../components/OrgContext';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {org, setOrg} = useContext(OrgContext);
  const [total,setTotal] = useState([]);
  
   useEffect(() => {
  axios.post('http://localhost:3001/query/CountBySeverity',{},{
  	headers:{
  		'x-org':org
  	}
  }).then(response => {
  		const value = response.data;
		setTotal(value);
  	});
  }, []);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={total.Low + total.Medium + total.High}
            subtitle="Total Logs"
            progress="0"
            increase="0"
            icon={
              <DescriptionIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px", mr:"5px"}}
              />
            }
          />
        </Box>
        <Box
         gridColumn="span 5"
         gridRow="span 2"
         backgroundColor={colors.primary[400]}>
         
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Logs by Severity Types
          </Typography>
          <Box height="250px" mt="-20px">
           <PieChart />
          </Box>
        </Box>
        
         <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Logs' Attack Types
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Weekly Uploaded Logs
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                By Severity Types
              </Typography>
            </Box>
            <Box>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
        

        {/* ROW 3 */}
        
       
        
      </Box>
    </Box>
  );
};

export default Dashboard;
