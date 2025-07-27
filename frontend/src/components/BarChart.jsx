import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import React, { useEffect, useState, useContext } from 'react';
import { apiClient, endpoints, withOrg } from '../api';
import { OrgContext } from './OrgContext';

const BarChart = ({ isDashboard = false }) => {
  const [data, setData] = useState([]);
  const [keys, setKeys] = useState([]);
  const { org } = useContext(OrgContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    apiClient
      .post(endpoints.countByAttackType, {}, withOrg(org))
      .then(response => {
        const bars = Object.entries(response.data).map(([key, value]) => ({
          id: key,
          [key]: value
        }));
        setData(bars);
        setKeys(Object.keys(response.data));
      })
      .catch(error => console.error('Errore CountByAttackType:', error));
  }, [org]);

  return (
    <ResponsiveBar
      data={data}
      theme={{
        axis: {
          domain: { line: { stroke: colors.grey[100] } },
          legend: { text: { fill: colors.grey[100] } },
          ticks: {
            line: { stroke: colors.grey[100], strokeWidth: 1 },
            text: { fill: colors.grey[100] }
          }
        },
        legends: { text: { fill: colors.grey[100] } }
      }}
      keys={keys}
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      defs={[
        { id: "dots", type: "patternDots", background: "inherit", color: "#38bcb2", size: 4, padding: 1, stagger: true },
        { id: "lines", type: "patternLines", background: "inherit", color: "#eed312", rotation: -45, lineWidth: 6, spacing: 10 }
      ]}
      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Attack Type",
        legendPosition: "middle",
        legendOffset: 32
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Value",
        legendPosition: "middle",
        legendOffset: -40
      }}
      enableLabel={false}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [{ on: "hover", style: { itemOpacity: 1 } }]
        }
      ]}
      role="application"
      barAriaLabel={e => `${e.id}: ${e.formattedValue} in index: ${e.indexValue}`}
    />
  );
};

export default BarChart;
