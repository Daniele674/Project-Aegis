import React, { useEffect, useState, useContext } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTheme } from '@mui/material';
import { tokens } from '../theme';
import { OrgContext } from './OrgContext';
import { apiClient, endpoints, withOrg } from '../api';

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [logs, setLogs] = useState([]);
  const { org } = useContext(OrgContext);

  const days = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  useEffect(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    const week = {
      startUnix: Math.floor(start.getTime() / 1000),
      endUnix: Math.floor(end.getTime() / 1000),
    };

    apiClient
      .post(endpoints.timeRange, week, withOrg(org))
      .then((response) => {
        if (Array.isArray(response.data)) {
          console.log("Logs ricevuti:", response.data); // Debug
          setLogs(response.data);
        } else {
          setLogs([]);
        }
      })
      .catch((err) => {
        console.error('Errore TimeRange:', err);
        setLogs([]);
      });
  }, [org]);

  const countData = (date, severity) => {
    const target = date.toISOString().split('T')[0];
    return logs.reduce((cnt, log) => {
      const logDay = log.timestamp?.split('T')[0];
      const logSeverity = log.severity?.toLowerCase();
      return logDay === target && logSeverity === severity.toLowerCase()
        ? cnt + 1
        : cnt;
    }, 0);
  };

  const nivoData = ['Low', 'Medium', 'High'].map((severity) => ({
    id: severity,
    color:
      severity === 'Low'
        ? colors.greenAccent[500]
        : severity === 'Medium'
        ? colors.blueAccent[300]
        : colors.redAccent[200],
    data: days.map((d) => ({
      x: d.toISOString().split('T')[0],
      y: countData(d, severity),
    })),
  }));

  return (
    <ResponsiveLine
      data={nivoData}
      theme={{
        axis: {
          domain: { line: { stroke: colors.grey[100] } },
          legend: { text: { fill: colors.grey[100] } },
          ticks: {
            line: { stroke: colors.grey[100], strokeWidth: 1 },
            text: { fill: colors.grey[100] },
          },
        },
        legends: { text: { fill: colors.grey[100] } },
        tooltip: { container: { background: colors.primary[500] } },
      }}
      colors={isDashboard ? { datum: 'color' } : { scheme: 'nivo' }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: true,
        reverse: false,
      }}
      curve="catmullRom"
      axisBottom={{
        tickSize: 0,
        tickPadding: 5,
        legend: isDashboard ? undefined : 'Days',
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        tickValues: 5,
        legend: isDashboard ? undefined : 'Count',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      useMesh={true}
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'column',
          translateX: 100,
          itemWidth: 80,
          itemHeight: 20,
          symbolSize: 12,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: { itemBackground: 'rgba(0,0,0,0.03)', itemOpacity: 1 },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
