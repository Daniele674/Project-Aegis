import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
//import { mockLineData as data } from "../data/mockData";
import axios from 'axios';
import React, {useEffect, useState, useContext} from 'react';
import {OrgContext} from './OrgContext';

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [logs, setLogs] = useState([]);
  const {org, setOrg} = useContext(OrgContext);
  const days=[];
  const now = new Date();
  for (let i=0; i<=7 ; i++){
  	const date = new Date();
  	date.setDate(now.getDate() - i);
  	days.push(date);
  }
  //days.sort((a,b)=> a-b);
  now.setHours(23,59,59,0);
  const endUnix = Math.floor(now.getTime() / 1000);
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 7);
  startDate.setHours(0,0,0,0);
  const startUnix = Math.floor(startDate.getTime() / 1000);
  const week = {
  	"startUnix": startUnix,
  	"endUnix": endUnix
  };
  
  useEffect(() => {
  axios.post('http://localhost:3001/query/TimeRange', week,{
  	headers:{
  		'x-org':org
  	}
  }).then(response => {
        const data = response.data
        if (Array.isArray(response.data) && response.data.length > 0){
  	const data = response.data.map(log =>({
  		timestamp: log.timestamp,
  		severity:log.severity
  		}));
  		console.log("log",data);
  		setLogs(data);
  	}
  	});
        
  },[]);

 function countData(logs, date, severity){
 	const day = date.toISOString().split("T")[0];
 	return logs.reduce((total, log) => {
 	 const logDate = log.timestamp.split("T")[0];
 	 if(logDate === day && log.severity === severity){
 		return total +1;
 	 }
 	 return total;
 	},0);
 
 };


 const data = [
  {
 	id:"Low",
 	color: tokens("dark").greenAccent[500],
 	data:[
 	 { 
           x: days[0].toISOString().split("T")[0],
           y: countData(logs,days[0],"Low")
 	 },
 	 {
 	   x: days[1].toISOString().split("T")[0],
 	   y: countData(logs,days[1],"Low")
 	 },
 	 {
 	   x: days[2].toISOString().split("T")[0],
 	   y: countData(logs,days[2],"Low")
 	 },
 	 {
 	   x: days[3].toISOString().split("T")[0],
 	   y: countData(logs,days[3],"Low")
 	 },
 	 {
 	   x: days[4].toISOString().split("T")[0],
 	   y: countData(logs,days[4],"Low")
 	 },
 	 {
 	   x: days[5].toISOString().split("T")[0],
 	   y: countData(logs,days[5],"Low")
 	 },
 	 {
 	   x: days[6].toISOString().split("T")[0],
 	   y: countData(logs,days[6],"Low")
 	 },
 	{
 	   x: days[7].toISOString().split("T")[0],
 	   y: countData(logs,days[7],"Low")
 	 },
 	],
  },
  {
  	id:"Medium",
  	color: tokens("dark").blueAccent[300],
  	data:[
  		{ 
           x: days[0].toISOString().split("T")[0],
           y: countData(logs,days[0],"Medium")
 	 },
 	 {
 	   x: days[1].toISOString().split("T")[0],
 	   y: countData(logs,days[1],"Medium")
 	 },
 	 {
 	   x: days[2].toISOString().split("T")[0],
 	   y: countData(logs,days[2],"Medium")
 	 },
 	 {
 	   x: days[3].toISOString().split("T")[0],
 	   y: countData(logs,days[3],"Medium")
 	 },
 	 {
 	   x: days[4].toISOString().split("T")[0],
 	   y: countData(logs,days[4],"Medium")
 	 },
 	 {
 	   x: days[5].toISOString().split("T")[0],
 	   y: countData(logs,days[5],"Medium")
 	 },
 	 {
 	   x: days[6].toISOString().split("T")[0],
 	   y: countData(logs,days[6],"Medium")
 	 },
 	 {
 	   x: days[7].toISOString().split("T")[0],
 	   y: countData(logs,days[7],"Medium")
 	 },
  	],
  },
  {
  	id:"High",
  	color: tokens("dark").redAccent[200],
  	data: [
  		{ 
           x: days[0].toISOString().split("T")[0],
           y: countData(logs,days[0],"High")
 	 },
 	 {
 	   x: days[1].toISOString().split("T")[0],
 	   y: countData(logs,days[1],"High")
 	 },
 	 {
 	   x: days[2].toISOString().split("T")[0],
 	   y: countData(logs,days[2],"High")
 	 },
 	 {
 	   x: days[3].toISOString().split("T")[0],
 	   y: countData(logs,days[3],"High")
 	 },
 	 {
 	   x: days[4].toISOString().split("T")[0],
 	   y: countData(logs,days[4],"High")
 	 },
 	 {
 	   x: days[5].toISOString().split("T")[0],
 	   y: countData(logs,days[5],"High")
 	 },
 	 {
 	   x: days[6].toISOString().split("T")[0],
 	   y: countData(logs,days[6],"High")
 	 },
 	 {
 	   x: days[7].toISOString().split("T")[0],
 	   y: countData(logs,days[7],"High")
 	 },
  	],
  }
 ];

  return (
    <ResponsiveLine
      data={data}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }} // added
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Days", // added
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5, // added
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Count", // added
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
