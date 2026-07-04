import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const DATA   = [6200, 7800, 5400, 9100, 6800, 8450];

export function IncomeChart() {
  return (
    <Bar
      data={{
        labels: MONTHS,
        datasets: [
          {
            label: 'Income',
            data: DATA,
            backgroundColor: 'rgba(234,88,12,0.85)',
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ' ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(ctx.parsed.y),
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => '$' + Number(v).toLocaleString(),
              font: { size: 11 },
              color: '#94a3b8',
            },
            grid: { color: '#f1f5f9' },
          },
          x: {
            ticks: { font: { size: 11 }, color: '#94a3b8' },
            grid: { display: false },
          },
        },
      }}
    />
  );
}
