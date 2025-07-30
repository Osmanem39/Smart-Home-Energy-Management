// import React, { useState } from 'react';
// import api from '../utils/api';
// import './DeviceControl.css';

// function DeviceControl() {
//   const [deviceId, setDeviceId] = useState('');
//   const [status, setStatus] = useState(false);
//   const [msg, setMsg] = useState('');

//   const handleToggle = async () => {
//     try {
//       await api.post(`/device/${deviceId}`, { status });
//       setMsg('Device toggled!');
//     } catch {
//       setMsg('Error toggling device');
//     }
//   };

//   return (
//     <div className="device-bg">
//       <h2>🔌 Device Control</h2>
//       <input value={deviceId} onChange={e => setDeviceId(e.target.value)} placeholder="Device ID" />
//       <label>
//         <input type="checkbox" checked={status} onChange={e => setStatus(e.target.checked)} />
//         On/Off
//       </label>
//       <button onClick={handleToggle}>Toggle</button>
//       {msg && <div className="msg">{msg}</div>}
//     </div>
//   );
// }

// export default DeviceControl;


























































import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './DeviceControl.css';

function DeviceControl() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [status, setStatus] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await api.get('/devices');
        setDevices(res.data);
        if (res.data.length > 0) {
          setSelectedDevice(res.data[0].device_id);
        }
      } catch (err) {
        setMessage('Failed to load devices');
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const handleToggle = async () => {
    if (!selectedDevice) return;
    
    try {
      const [homeId, applianceType] = selectedDevice.split('_');
      await api.post(`/device/${homeId}`, { 
        status,
        appliance_type: applianceType 
      });
      setMessage(`Device ${selectedDevice} set to ${status ? 'ON' : 'OFF'}`);
    } catch (err) {
      setMessage('Error toggling device');
    }
  };

  if (loading) return <div className="device-bg">Loading devices...</div>;

  return (
    <div className="device-bg">
      <h2>🔌 Device Control</h2>
      
      <div className="device-control-form">
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          disabled={devices.length === 0}
        >
          {devices.length > 0 ? (
            devices.map((device) => (
              <option key={device.device_id} value={device.device_id}>
                Home {device.home_id} - {device.appliance_type}
              </option>
            ))
          ) : (
            <option value="">No devices available</option>
          )}
        </select>

        <div className="toggle-section">
          <label>
            <input
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
            {status ? 'ON' : 'OFF'}
          </label>
          <button 
            onClick={handleToggle}
            disabled={!selectedDevice}
          >
            Set Device
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default DeviceControl;