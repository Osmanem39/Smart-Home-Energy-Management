import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './Dashboard.css';

function Dashboard() {
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    api.get('/sensors').then(res => setSensors(res.data));
  }, []);

  // Calculate summary stats
  const totalEnergy = sensors.reduce((sum, row) => sum + (row.energy_consumption_kwh || 0), 0);
  const avgTemp = sensors.length ? (sensors.reduce((sum, row) => sum + (row.outdoor_temperature_c || 0), 0) / sensors.length).toFixed(1) : 0;
  const avgHousehold = sensors.length ? (sensors.reduce((sum, row) => sum + (row.household_size || 0), 0) / sensors.length).toFixed(1) : 0;

  return (
    <div className="dashboard-bg">
      <h2>⚡ Live Sensor Data</h2>
      <div className="summary-cards">
        <div className="summary-card">
          <b>Total Energy (kWh)</b>
          <div>{totalEnergy.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <b>Avg Temp (°C)</b>
          <div>{avgTemp}</div>
        </div>
        <div className="summary-card">
          <b>Avg Household Size</b>
          <div>{avgHousehold}</div>
        </div>
      </div>
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
          {sensors.map(row => (
            <tr key={row.id}>
              <td>{row.home_id}</td>
              <td>{row.appliance_type}</td>
              <td>{row.energy_consumption_kwh}</td>
              <td>{row.timestamp}</td>
              <td>{row.outdoor_temperature_c}</td>
              <td>{row.season}</td>
              <td>{row.household_size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;