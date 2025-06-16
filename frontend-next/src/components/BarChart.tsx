"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  dataStat: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
}

export default function BarChart({ dataStat }: BarChartProps) {
  return (
    <Bar
      data={dataStat}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            ticks: {
              color: "#6B7280",
            },
            grid: {
              color: "#E5E7EB",
            },
          },
          x: {
            ticks: {
              color: "#6B7280",
            },
            grid: {
              display: false,
            },
          },
        },
      }}
      height={180}
    />
  );
}
