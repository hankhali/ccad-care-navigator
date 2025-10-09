import { useState, useEffect } from "react";
import { Watch, Activity, Heart, Zap, Smartphone, Wifi, WifiOff, RefreshCw } from "lucide-react";
import "./WearableSync.css";

interface WearableDevice {
  id: string;
  name: string;
  type: 'apple_watch' | 'fitbit' | 'garmin' | 'samsung';
  connected: boolean;
  lastSync: string;
  batteryLevel?: number;
}

interface HealthMetrics {
  steps: number;
  heartRate: number;
  calories: number;
  sleepHours: number;
  activeMinutes: number;
  timestamp: string;
}

export default function WearableSync() {
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);

  useEffect(() => {
    loadDevices();
    loadMetrics();
    
    // Simulate periodic sync
    const interval = setInterval(() => {
      if (devices.some(d => d.connected)) {
        syncData();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [devices]);

  const loadDevices = () => {
    const stored = JSON.parse(localStorage.getItem('wearableDevices') || '[]');
    setDevices(stored);
  };

  const loadMetrics = () => {
    const stored = JSON.parse(localStorage.getItem('healthMetrics') || 'null');
    setMetrics(stored);
  };

  const saveDevices = (newDevices: WearableDevice[]) => {
    setDevices(newDevices);
    localStorage.setItem('wearableDevices', JSON.stringify(newDevices));
  };

  const saveMetrics = (newMetrics: HealthMetrics) => {
    setMetrics(newMetrics);
    localStorage.setItem('healthMetrics', JSON.stringify(newMetrics));
  };

  const connectDevice = (deviceType: WearableDevice['type']) => {
    const deviceNames = {
      apple_watch: 'Apple Watch',
      fitbit: 'Fitbit Charge 5',
      garmin: 'Garmin Venu 2',
      samsung: 'Galaxy Watch 4'
    };

    const newDevice: WearableDevice = {
      id: String(Date.now()),
      name: deviceNames[deviceType],
      type: deviceType,
      connected: true,
      lastSync: new Date().toISOString(),
      batteryLevel: Math.floor(Math.random() * 40) + 60 // 60-100%
    };

    const updated = [...devices, newDevice];
    saveDevices(updated);
    setShowAddDevice(false);
    
    // Generate initial metrics
    generateMockMetrics();
    
    alert(`${newDevice.name} connected successfully!`);
  };

  const disconnectDevice = (deviceId: string) => {
    const updated = devices.map(device => 
      device.id === deviceId ? { ...device, connected: false } : device
    );
    saveDevices(updated);
  };

  const removeDevice = (deviceId: string) => {
    const updated = devices.filter(device => device.id !== deviceId);
    saveDevices(updated);
  };

  const syncData = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update last sync time for connected devices
    const updated = devices.map(device => 
      device.connected ? { ...device, lastSync: new Date().toISOString() } : device
    );
    saveDevices(updated);
    
    // Generate new metrics
    generateMockMetrics();
    
    setIsLoading(false);
  };

  const generateMockMetrics = () => {
    const now = new Date();
    const newMetrics: HealthMetrics = {
      steps: Math.floor(Math.random() * 5000) + 3000,
      heartRate: Math.floor(Math.random() * 30) + 65,
      calories: Math.floor(Math.random() * 800) + 1200,
      sleepHours: Math.floor(Math.random() * 3) + 6,
      activeMinutes: Math.floor(Math.random() * 60) + 30,
      timestamp: now.toISOString()
    };
    saveMetrics(newMetrics);
  };

  const getDeviceIcon = (type: WearableDevice['type']) => {
    switch (type) {
      case 'apple_watch': return '⌚';
      case 'fitbit': return '⌚';
      case 'garmin': return '⌚';
      case 'samsung': return '⌚';
      default: return '⌚';
    }
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const connectedDevices = devices.filter(d => d.connected);

  return (
    <div className="wearable-sync-container">
      <div className="wearable-header">
        <div className="wearable-title">
          <Watch size={20} />
          <h3>Wearable Devices</h3>
        </div>
        <button 
          onClick={() => setShowAddDevice(!showAddDevice)}
          className="add-device-btn"
        >
          + Add Device
        </button>
      </div>

      <div className="wearable-content">
        {/* Add Device Panel */}
        {showAddDevice && (
          <div className="add-device-panel">
            <h4>Connect a Device</h4>
            <div className="device-options">
              <button onClick={() => connectDevice('apple_watch')} className="device-option">
                <span className="device-icon">⌚</span>
                <span>Apple Watch</span>
              </button>
              <button onClick={() => connectDevice('fitbit')} className="device-option">
                <span className="device-icon">⌚</span>
                <span>Fitbit</span>
              </button>
              <button onClick={() => connectDevice('garmin')} className="device-option">
                <span className="device-icon">⌚</span>
                <span>Garmin</span>
              </button>
              <button onClick={() => connectDevice('samsung')} className="device-option">
                <span className="device-icon">⌚</span>
                <span>Samsung</span>
              </button>
            </div>
          </div>
        )}

        {/* Connected Devices */}
        {devices.length > 0 && (
          <div className="devices-section">
            <h4>My Devices</h4>
            <div className="devices-list">
              {devices.map((device) => (
                <div key={device.id} className={`device-item ${device.connected ? 'connected' : 'disconnected'}`}>
                  <div className="device-info">
                    <div className="device-main">
                      <span className="device-icon">{getDeviceIcon(device.type)}</span>
                      <div className="device-details">
                        <div className="device-name">{device.name}</div>
                        <div className="device-status">
                          {device.connected ? (
                            <>
                              <Wifi size={12} />
                              <span>Connected • Last sync {formatLastSync(device.lastSync)}</span>
                            </>
                          ) : (
                            <>
                              <WifiOff size={12} />
                              <span>Disconnected</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {device.batteryLevel && (
                      <div className="battery-level">
                        <div className="battery-icon">
                          <div 
                            className="battery-fill"
                            style={{ width: `${device.batteryLevel}%` }}
                          />
                        </div>
                        <span>{device.batteryLevel}%</span>
                      </div>
                    )}
                  </div>
                  <div className="device-actions">
                    {device.connected ? (
                      <button 
                        onClick={() => disconnectDevice(device.id)}
                        className="disconnect-btn"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button 
                        onClick={() => connectDevice(device.type)}
                        className="connect-btn"
                      >
                        Connect
                      </button>
                    )}
                    <button 
                      onClick={() => removeDevice(device.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Metrics */}
        {connectedDevices.length > 0 && (
          <div className="metrics-section">
            <div className="metrics-header">
              <h4>Today's Health Data</h4>
              <button 
                onClick={syncData}
                className={`sync-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
                {isLoading ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
            
            {metrics ? (
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">👟</div>
                  <div className="metric-value">{metrics.steps.toLocaleString()}</div>
                  <div className="metric-label">Steps</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">❤️</div>
                  <div className="metric-value">{metrics.heartRate}</div>
                  <div className="metric-label">Heart Rate</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🔥</div>
                  <div className="metric-value">{metrics.calories}</div>
                  <div className="metric-label">Calories</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">😴</div>
                  <div className="metric-value">{metrics.sleepHours}h</div>
                  <div className="metric-label">Sleep</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-value">{metrics.activeMinutes}m</div>
                  <div className="metric-label">Active</div>
                </div>
              </div>
            ) : (
              <div className="no-metrics">
                <Activity size={32} />
                <p>No health data available</p>
                <small>Sync your device to see metrics</small>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {devices.length === 0 && (
          <div className="empty-wearables">
            <Smartphone size={48} />
            <p>No devices connected</p>
            <small>Connect your wearable device to track health metrics</small>
          </div>
        )}
      </div>
    </div>
  );
}
