import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { OrgContext } from './OrgContext';

const PieChart = () => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { org } = useContext(OrgContext);

  useEffect(() => {
    axios.post('http://localhost:3001/query/CountBySeverity', {}, {
      headers: {
        'x-org': org
      }
    }).then(response => {
      const value = response.data;
      console.log("Dati CountBySeverity:", value); // Debug

      const formattedData = [
        { id: "low", label: "Low", value: value.low || 0 },
        { id: "medium", label: "Medium", value: value.medium || 0 },
        { id: "high", label: "High", value: value.high || 0 },
        { id: "critical", label: "Critical", value: value.critical || 0 }
      ];

      setData(formattedData);
    }).catch(err => {
      console.error("Errore nel recupero dati CountBySeverity:", err);
    });
  }, [org]);

  return (
    <ResponsivePie
      data={data}
      theme={{
        axis: {
          domain: {
            line: { stroke: colors.grey[100] },
          },
          legend: {
            text: { fill: colors.grey[100] },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: { fill: colors.grey[100] },
          },
        },
        legends: {
          text: { fill: colors.grey[100] },
        },
        tooltip: {
          container: { background: colors.primary[500] },
        }
      }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
    />
  );
};

export default PieChart;
