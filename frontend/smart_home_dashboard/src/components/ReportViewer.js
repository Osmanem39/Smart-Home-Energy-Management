// import React, { useEffect, useState } from 'react';
// import api from '../utils/api';
// import { Bar } from 'react-chartjs-2';
// import './ReportViewer.css';

// function ReportViewer() {
//   const [report, setReport] = useState(null);

//   useEffect(() => {
//     api.get('/report').then(res => setReport(res.data));
//   }, []);

//   if (!report) return <div className="report-bg">Loading...</div>;

//   const chartData = {
//     labels: Object.keys(report.summary.weekly_kwh || {}),
//     datasets: [
//       {
//         label: 'Weekly Predicted kWh',
//         data: Object.values(report.summary.weekly_kwh || {}),
//         backgroundColor: '#4caf50',
//       },
//     ],
//   };

//   return (
//     <div className="report-bg">
//       <h2>📊 Energy Report</h2>
//       <div className="summary">
//         <p><b>Total Predicted kWh:</b> {report.summary.total_predicted_kwh.toFixed(2)}</p>
//         <Bar data={chartData} />
//       </div>
//       <h3>Recommendations</h3>
//       <ul>
//         {report.recommendations.length === 0 && <li>No recommendations. All good!</li>}
//         {report.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
//       </ul>
//       <h3>Details</h3>
//       <div className="details-table-wrapper">
//         <table className="energy-table">
//           <thead>
//             <tr>
//               <th>Home ID</th>
//               <th>Appliance</th>
//               <th>Predicted kWh</th>
//               <th>Temp (°C)</th>
//               <th>Season</th>
//               <th>Household Size</th>
//               <th>Timestamp</th>
//             </tr>
//           </thead>
//           <tbody>
//             {report.details.map((row, i) => (
//               <tr key={i}>
//                 <td>{row.home_id}</td>
//                 <td>{row.appliance_type}</td>
//                 <td>{row.predicted_consumption && row.predicted_consumption.toFixed(2)}</td>
//                 <td>{row.outdoor_temperature_c}</td>
//                 <td>{row.season}</td>
//                 <td>{row.household_size}</td>
//                 <td>{row.timestamp}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default ReportViewer;









































import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import './ReportViewer.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ReportViewer() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get('/report');
        setReport(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load report. Please try again.');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <div className="report-bg">Loading report...</div>;
  if (error) return <div className="report-bg error-message">{error}</div>;
  if (!report) return <div className="report-bg">No report data available</div>;

  const chartData = {
    labels: report.chart_data?.dates || [],
    datasets: report.chart_data?.homes.map((home, index) => ({
      label: `Home ${home}`,
      data: report.chart_data.values.map(row => row[index]),
      backgroundColor: `hsl(${index * 360 / report.chart_data.homes.length}, 70%, 50%)`,
    })) || []
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Energy Consumption by Home',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energy Consumption (kWh)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return (
    <div className="report-bg">
      <h2>📊 Energy Report</h2>
      
      <div className="summary-section">
        <h3>Summary</h3>
        <p>Total Predicted Consumption: <strong>{report.summary.total_predicted_kwh?.toFixed(2) || 0} kWh</strong></p>
        <div className="chart-container">
          <Bar data={chartData} options={options} />
        </div>
      </div>

      <div className="recommendations-section">
        <h3>Recommendations</h3>
        {report.recommendations.length > 0 ? (
          <ul>
            {report.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p>No specific recommendations. Energy usage looks good!</p>
        )}
      </div>

      <div className="details-section">
        <h3>Detailed Data</h3>
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Home ID</th>
                <th>Appliance</th>
                <th>Date</th>
                <th>Predicted kWh</th>
                <th>Avg Temp (°C)</th>
                <th>Household Size</th>
              </tr>
            </thead>
            <tbody>
              {report.details.map((row, i) => (
                <tr key={i}>
                  <td>{row.home_id}</td>
                  <td>{row.appliance_type}</td>
                  <td>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.predicted_consumption?.toFixed(2)}</td>
                  <td>{row.Avg_Temp?.toFixed(1)}</td>
                  <td>{row.Household_Size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportViewer;