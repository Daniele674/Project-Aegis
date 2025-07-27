import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import PieChart from "../../components/PieChart";
import DescriptionIcon from "@mui/icons-material/Description";
import React, { useEffect, useState, useContext } from "react";
import { OrgContext } from "../../components/OrgContext";
import { apiClient, endpoints, withOrg } from "../../api";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { org } = useContext(OrgContext);
  const [total, setTotal] = useState({ Low: 0, Medium: 0, High: 0, Critical: 0 });
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    apiClient
      .post(endpoints.countBySeverity, {}, withOrg(org))
      .then((response) => {
        const value = response.data || {};
        const totalCount =
          (value.low || 0) + (value.medium || 0) + (value.high || 0) + (value.critical || 0);

        setTotal({
          Low: value.low || 0,
          Medium: value.medium || 0,
          High: value.high || 0,
          Critical: value.critical || 0,
        });

        setTotalLogs(totalCount);
      })
      .catch((err) => {
        console.error("Errore CountBySeverity (Dashboard):", err);
        setTotal({ Low: 0, Medium: 0, High: 0, Critical: 0 });
        setTotalLogs(0);
      });
  }, [org]);

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
        {/* StatBox: Total Logs */}
        <Box
          gridColumn="span 3"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalLogs}
            subtitle="Total Logs"
            progress="0"
            increase="0"
            icon={
              <DescriptionIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px", mr: "5px" }}
              />
            }
          />
        </Box>

        {/* Pie Chart: Severity */}
        <Box
          gridColumn="span 5"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Logs by Severity Types
          </Typography>
          <Box height="250px" mt="-20px">
            <PieChart totalLogs={totalLogs} />
          </Box>
        </Box>

        {/* Bar Chart: Attack Types */}
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

        {/* Line Chart: Weekly Logs */}
        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
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
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
