import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './DeviceControl.css';

function DeviceControl() {
  const [devices, setDevices] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/devices')
      .then(res => setDevices(res.data))
      .catch(() => setMsg('Failed to load devices.'));
  }, []);

  const handleToggle = async (device) => {
    setLoading(true);
    setMsg('');
    try {
      await api.post(`/device/${device.home_id}`, { status: true });
      setMsg(`Toggled ${device.appliance_type} for Home ${device.home_id}`);
    } catch {
      setMsg('Error toggling device');
    }
    setLoading(false);
  };

  return (
    <div className="device-bg">
      <h2>🔌 Device Control</h2>
      <div className="device-list">
        {devices.length === 0 && <div>Loading devices...</div>}
        {devices.map(device => (
          <div className="device-card" key={device.device_id}>
            <div className="device-info">
              <b>Home:</b> {device.home_id}<br/>
              <b>Appliance:</b> {device.appliance_type}
            </div>
            <button className="toggle-btn" onClick={() => handleToggle(device)} disabled={loading}>
              Toggle
            </button>
          </div>
        ))}
      </div>
      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}

export default DeviceControl;