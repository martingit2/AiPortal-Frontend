// src/pages/dashboard/components/TeamFormChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TeamFormChart.css';

// Dataformatet forventer nå flere mulige statistikker
export interface ChartDataPoint {
  matchDate: string;
  opponent: string;
  shotsOnGoal?: number;
  corners?: number;
  fouls?: number;
  // Legg til flere valgfrie (optional) stats her ved behov
}

interface TeamFormChartProps {
  data: ChartDataPoint[];
  dataKey: keyof ChartDataPoint; // 'shotsOnGoal', 'corners', etc.
  lineName: string; // "Skudd på mål", "Hjørnespark", etc.
  lineColor: string; // F.eks. "#8884d8"
}

// Egendefinert Tooltip for å vise mer kontekst
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    return (
      <div className="custom-tooltip">
        <p className="label">{`Dato: ${label}`}</p>
        <p className="intro" style={{ color: dataPoint.color }}>
          {`${dataPoint.name}: ${dataPoint.value}`}
        </p>
        <p className="desc">{`Motstander: ${dataPoint.payload.opponent}`}</p>
      </div>
    );
  }
  return null;
};

const TeamFormChart: React.FC<TeamFormChartProps> = ({ data, dataKey, lineName, lineColor }) => {
  if (!data || data.length === 0) {
    return <div className="chart-no-data">Ikke nok data til å vise graf.</div>;
  }

  return (
    <div className="chart-container">
      <h4>Formutvikling ({lineName}, siste {data.length} kamper)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="matchDate" 
            stroke="#9ca3af"
          />
          <YAxis 
            stroke="#9ca3af"
            allowDecimals={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} /> 
          
          {/* Linjen bruker nå dynamiske props */}
          <Line 
            type="monotone" 
            dataKey={dataKey} // Dynamisk datanøkkel
            name={lineName}   // Dynamisk navn
            stroke={lineColor} // Dynamisk farge
            strokeWidth={2}
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeamFormChart;