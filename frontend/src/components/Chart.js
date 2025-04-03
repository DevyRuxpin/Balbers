import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Chart({ data }) {
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map(item => new Date(item.time).toLocaleDateString()),
    datasets: [
      {
        label: 'Price',
        data: data.map(item => item.close),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };

  return <Line ref={chartRef} data={chartData} options={options} />;
}

export default Chart;
