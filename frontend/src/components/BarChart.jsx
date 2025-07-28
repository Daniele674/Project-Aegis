import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import React, { useEffect, useState, useContext } from 'react';
import { apiClient, endpoints, withOrg } from '../api';
import { OrgContext } from './OrgContext';

// Componente per un tooltip personalizzato
const CustomTooltip = ({ id, value, color }) => (
    <div
        style={{
            padding: '12px 16px',
            background: '#2d2d2d',
            color: '#fff',
            border: '1px solid #ccc',
            borderRadius: '3px',
        }}
    >
        <strong style={{ color }}>{id}</strong>: {value}
    </div>
);

/**
 * Calcola i valori dei tick interi per l'asse Y del grafico.
 * @param {number} max - Il valore massimo dei dati.
 * @returns {number[]} Un array di numeri interi da usare come tick.
 */
const getIntegerTickValues = (max) => {
    if (max <= 0) return [0];

    let step;
    if (max <= 10) {
        step = 1;
    } else if (max <= 20) {
        step = 2;
    } else if (max <= 50) {
        step = 5;
    } else {
        // Calcola un passo "bello" per numeri più grandi (es. 10, 20, 50, 100...)
        const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
        const potentialStep = magnitude / 2; // es. 50 per un max di 450, 500 per un max di 1200
        if (max / potentialStep > 8) { // Se risultano troppi tick, usa un passo più grande
            step = magnitude;
        } else {
            step = potentialStep;
        }
    }
    // Arrotonda il passo al numero intero più vicino se necessario
    step = Math.max(1, Math.round(step));

    const ticks = [];
    for (let i = 0; i <= max + step; i += step) {
        ticks.push(i);
        if (i > max) break; // Interrompi dopo aver superato il massimo
    }
    
    // Rimuovi l'ultimo tick se è troppo lontano dal massimo
    if (ticks.length > 2 && ticks[ticks.length - 1] > max + step) {
        ticks.pop();
    }

    return ticks;
};


const BarChart = ({ isDashboard = false }) => {
  const [data, setData] = useState([]);
  const [tickValues, setTickValues] = useState([0]);
  const { org } = useContext(OrgContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    apiClient
      .post(endpoints.countByAttackType, {}, withOrg(org))
      .then(response => {
        const chartData = Object.entries(response.data).map(([attackType, count]) => ({
          attackType: attackType,
          count: count
        }));
        
        // Calcola il valore massimo per definire la scala e i tick
        const maxValue = Math.max(...chartData.map(d => d.count), 0);

        setData(chartData);
        setTickValues(getIntegerTickValues(maxValue));
      })
      .catch(error => console.error('Errore CountByAttackType:', error));
  }, [org]);

  return (
    <ResponsiveBar
      data={data}
      keys={['count']} 
      indexBy="attackType"
      theme={{
        axis: {
          domain: { line: { stroke: colors.grey[100] } },
          legend: { text: { fill: colors.grey[100] } },
          ticks: {
            line: { stroke: colors.grey[100], strokeWidth: 1 },
            text: { fill: colors.grey[100] }
          }
        },
        tooltip: {
            container: {
                background: colors.primary[400],
                color: colors.grey[100],
            },
        },
        grid: {
            line: {
                stroke: colors.grey[700],
                strokeWidth: 1
            }
        }
      }}
      margin={{ top: 60, right: 60, bottom: 100, left: 60 }}
      padding={0.4}
      valueScale={{ 
        type: "linear",
        min: 0,
        // Imposta il massimo della scala al tick più alto per avere spazio
        max: tickValues[tickValues.length - 1] || 0 
      }}
      indexScale={{ type: "band", round: true }}
      colors={colors.greenAccent[500]}
      defs={[
        {
            id: 'gradient',
            type: 'linearGradient',
            colors: [
                { offset: 0, color: colors.blueAccent[400] },
                { offset: 100, color: colors.greenAccent[500] },
            ],
        },
      ]}
      fill={[{ match: '*', id: 'gradient' }]}
      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45, 
        legend: isDashboard ? undefined : "Attack Type",
        legendPosition: "middle",
        legendOffset: 80, 
        truncateTickAt: 0,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Count",
        legendPosition: "middle",
        legendOffset: -50,
        // Usa i tick calcolati per garantire valori interi
        tickValues: tickValues,
      }}
      enableLabel={true}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      tooltip={({ id, value, color }) => (
          <CustomTooltip id={id} value={value} color={color} />
      )}
      role="application"
      barAriaLabel={e => `${e.indexValue}: ${e.formattedValue}`}
      animate={true} 
      motionConfig="gentle"
    />
  );
};

export default BarChart;
