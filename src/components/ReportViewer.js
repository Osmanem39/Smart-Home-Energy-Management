import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Bar } from 'react-chartjs-2';
import './ReportViewer.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ReportViewer() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/report')
      .then(res => {
        setReport(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load report. Please try again after logging in.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="report-bg">Loading...</div>;
  if (error) return <div className="report-bg error-msg">{error}</div>;
  if (!report || !report.summary || !report.chart_data) {
    return <div className="report-bg error-msg">No report data available.</div>;
  }

  // Chart data for daily predicted kWh per home
  const chartData = {
    labels: report.chart_data.dates || [],
    datasets: (report.chart_data.homes || []).map((home, idx) => ({
      label: `Home ${home}`,
      data: (report.chart_data.values || []).map(row => row[idx]),
      backgroundColor: `hsl(${(idx * 40) % 360}, 70%, 60%)`,
    }))
  };

  return (
    <div className="report-bg">
      <h2>📊 Energy Report</h2>
      <div className="summary-cards">
        <div className="summary-card">
          <b>Total Predicted kWh</b>
          <div>{report.summary.total_predicted_kwh ? report.summary.total_predicted_kwh.toFixed(2) : 0}</div>
        </div>
        <div className="summary-card">
          <b>Records</b>
          <div>{report.summary.num_records || 0}</div>
        </div>
      </div>
      <div className="chart-section">
        {chartData.labels.length > 0 && chartData.datasets.length > 0 ? (
          <Bar data={chartData} options={{responsive: true, plugins: {legend: {position: 'top'}}}} />
        ) : (
          <div>No chart data available.</div>
        )}
      </div>
      <h3>Recommendations</h3>
      <ul className="recommendations-list">
        {report.recommendations && report.recommendations.length === 0 && <li>No recommendations. All good!</li>}
        {report.recommendations && report.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
      </ul>
      <h3>Prediction Details</h3>
      <div className="details-table-wrapper">
        <table className="energy-table">
          <thead>
            <tr>
              <th>Home ID</th>
              <th>Appliance</th>
              <th>Date</th>
              <th>Predicted kWh</th>
              <th>Avg Temp (°C)</th>
              <th>Household Size</th>
              <th>Max Appliance kWh</th>
              <th>Appliance Count</th>
            </tr>
          </thead>
          <tbody>
            {report.details && report.details.length > 0 ? report.details.map((row, i) => (
              <tr key={i}>
                <td>{row.home_id}</td>
                <td>{row.appliance_type}</td>
                <td>{row.date && (new Date(row.date)).toLocaleDateString()}</td>
                <td>{row.predicted_consumption && row.predicted_consumption.toFixed(2)}</td>
                <td>{row.Avg_Temp}</td>
                <td>{row.Household_Size}</td>
                <td>{row.Max_Single_Appliance}</td>
                <td>{row.Appliance_Count}</td>
              </tr>
            )) : <tr><td colSpan={8}>No details available.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportViewer;