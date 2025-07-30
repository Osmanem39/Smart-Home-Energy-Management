// import React, { useEffect, useState } from 'react';
// import api from '../utils/api';
// import './Dashboard.css';

// function Dashboard() {
//   const [sensors, setSensors] = useState([]);

//   useEffect(() => {
//     api.get('/sensors').then(res => setSensors(res.data));
//   }, []);

//   return (
//     <div className="dashboard-bg">
//       <h2>⚡ Live Sensor Data</h2>
//       <table className="energy-table">
//         <thead>
//           <tr>
//             <th>Home ID</th>
//             <th>Appliance</th>
//             <th>Energy (kWh)</th>
//             <th>Time</th>
//             <th>Temp (°C)</th>
//             <th>Season</th>
//             <th>Household Size</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sensors.map(row => (
//             <tr key={row.id}>
//               <td>{row.home_id}</td>
//               <td>{row.appliance_type}</td>
//               <td>{row.energy_consumption_kwh}</td>
//               <td>{row.timestamp}</td>
//               <td>{row.outdoor_temperature_c}</td>
//               <td>{row.season}</td>
//               <td>{row.household_size}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default Dashboard;



































import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './Dashboard.css';

function Dashboard() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/sensors');
        setSensors(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load sensor data. Please try again.');
        setSensors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="dashboard-bg">Loading sensor data...</div>;

  return (
    <div className="dashboard-bg">
      <h2>⚡ Live Sensor Data</h2>
      {error && <div className="error-message">{error}</div>}
      
      {sensors.length > 0 ? (
        <table className="energy-table">
          <thead>
            <tr>
              <th>Home ID</th>
              <th>Appliance</th>
              <th>Energy (kWh)</th>
              <th>Time</th>
              <th>Temp (°C)</th>
              <th>Season</th>
              <th>Household Size</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((row) => (
              <tr key={row.id}>
                <td>{row.home_id}</td>
                <td>{row.appliance_type}</td>
                <td>{row.energy_consumption_kwh.toFixed(2)}</td>
                <td>{new Date(row.timestamp).toLocaleString()}</td>
                <td>{row.outdoor_temperature_c.toFixed(1)}</td>
                <td>{row.season}</td>
                <td>{row.household_size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <div>No sensor data available</div>
      )}
    </div>
  );
}

export default Dashboard;