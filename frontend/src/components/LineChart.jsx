import React, { useEffect, useState, useContext } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTheme, Box, Typography } from '@mui/material';
import { tokens } from '../theme';
import { OrgContext } from './OrgContext';
import { apiClient, endpoints, withOrg } from '../api';

/**
 * Pre-processa i log per aggregare i conteggi per giorno e per severity.
 * Questo è molto più performante rispetto a iterare i log più volte.
 * @param {Array} logs - L'array di log ricevuti dall'API.
 * @returns {Object} Un oggetto con i conteggi, es: { "2023-10-27": { low: 2, medium: 1, ... } }
 */
const aggregateLogCounts = (logs) => {
  const counts = {};
  for (const log of logs) {
    if (!log.timestamp || !log.severity) continue;

    const day = log.timestamp.split('T')[0];
    const severity = log.severity.toLowerCase();

    if (!counts[day]) {
      counts[day] = { low: 0, medium: 0, high: 0, critical: 0 };
    }
    if (counts[day][severity] !== undefined) {
      counts[day][severity]++;
    }
  }
  return counts;
};

const LineChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { org } = useContext(OrgContext);

  useEffect(() => {
    setLoading(true);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    const timeRange = {
      startUnix: Math.floor(start.getTime() / 1000),
      endUnix: Math.floor(end.getTime() / 1000),
    };

    apiClient
      .post(endpoints.timeRange, timeRange, withOrg(org))
      .then((response) => {
        const logs = Array.isArray(response.data) ? response.data : [];
        const logCounts = aggregateLogCounts(logs);

        const days = [];
        for (let i = 7; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d);
        }

        const severities = [
            { name: 'critical', color: colors.redAccent[500] },
            { name: 'high', color: colors.redAccent[200] },
            { name: 'medium', color: colors.blueAccent[300] },
            { name: 'low', color: colors.greenAccent[500] }
        ];

        const nivoData = severities.map(s => ({
            id: s.name,
            color: s.color,
            data: days.map(day => {
                const dayString = day.toISOString().split('T')[0];
                return {
                    x: dayString,
                    y: logCounts[dayString]?.[s.name] || 0
                }
            })
        }));

        setData(nivoData);
      })
      .catch((err) => {
        console.error('Errore TimeRange:', err);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [org]); // Aggiunto 'colors' alle dipendenze per coerenza

  if (loading) {
    return <Typography sx={{ p: 4 }}>Loading chart data...</Typography>;
  }

  if (!data || data.every(series => series.data.every(d => d.y === 0))) {
    return <Typography sx={{ p: 4 }}>No log data available for this period.</Typography>;
  }

  return (
    <ResponsiveLine
      data={data}
      theme={{
        axis: {
          domain: { line: { stroke: colors.grey[100] } },
          legend: { text: { fill: colors.grey[100], fontSize: 12 } },
          ticks: { line: { stroke: colors.grey[100], strokeWidth: 1 }, text: { fill: colors.grey[100] } },
        },
        legends: { text: { fill: colors.grey[100] } },
        tooltip: { container: { color: colors.grey[900] } },
        crosshair: { line: { stroke: colors.grey[400], strokeWidth: 1, strokeDasharray: '6 6' } },
      }}
      colors={{ datum: 'color' }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 0, // Inizia sempre da 0
        max: 'auto',
        stacked: false, // Non sovrapporre le linee per una migliore leggibilità
      }}
      yFormat=" >-.0f" // Formatta i valori Y come interi
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        format: (value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`; // Formato MM/DD
        },
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : 'Date',
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        // Mostra solo tick interi
        format: (v) => (Math.round(v) === v ? v : ''),
        legend: isDashboard ? undefined : 'Count',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      enableGridX={false}
      enableGridY={true} // Una griglia Y aiuta la lettura
      gridYValues={5} // Suggerisce 5 linee di griglia
      pointSize={8}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true} // Ottimo per le performance con molti punti
      enableCrosshair={true} // Aggiunge una croce per guidare l'occhio
      crosshairType="x"
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 80,
          itemHeight: 20,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 12,
          symbolShape: 'circle',
          effects: [
            { on: 'hover', style: { itemBackground: 'rgba(255, 255, 255, 0.03)', itemOpacity: 1 } },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
