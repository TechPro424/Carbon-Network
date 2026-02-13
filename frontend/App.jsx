import React, { useState, useEffect, useCallback } from 'react';
//import { ethers } from 'ethers';
import GhostViewer from '../GhostViewer';
import './App.css';

function App() {
    const [ghostData, setGhostData] = useState(null);
    const [deviceAddress, setDeviceAddress] = useState('');
    const [gridStatus, setGridStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const RELAY_URL = import.meta.env.VITE_RELAY_URL || 'http://localhost:3000';

    const fetchGhostData = useCallback(async () => {
        if (!deviceAddress) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${RELAY_URL}/ghost/${deviceAddress}`);
            const data = await response.json();
            setGhostData(data);
        } catch (error) {
            console.error('Error fetching ghost data:', error);
        }
        setLoading(false);
    }, [deviceAddress, RELAY_URL]);

    const fetchGridStatus = useCallback(async () => {
        try {
            const response = await fetch(`${RELAY_URL}/grid-status`);
            const data = await response.json();
            setGridStatus(data);
        } catch (error) {
            console.error('Error fetching grid status:', error);
        }
    }, [RELAY_URL]);

    useEffect(() => {
        // Poll for updates every 5 seconds
        const interval = setInterval(() => {
            if (deviceAddress) {
                fetchGhostData();
            }
            fetchGridStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, [deviceAddress, fetchGhostData, fetchGridStatus]);

    const handleConnect = () => {
        fetchGhostData();
        fetchGridStatus();
    };

    // Helper functions for seasonal display
    const getSeasonEmoji = (season) => {
        const emojis = {
            'Spring': '🌸',
            'Summer': '☀️',
            'Fall': '🍂',
            'Winter': '❄️',
            'Dead': '☠️'
        };
        return emojis[season] || '☀️';
    };

    const getHealthClass = (health) => {
        if (health >= 75) return 'spring';
        if (health >= 50) return 'summer';
        if (health >= 25) return 'fall';
        if (health >= 2) return 'winter';
        return 'dead';
    };

    const getHealthLabel = (health) => {
        if (health >= 75) return 'Healthy (Spring)';
        if (health >= 50) return 'Okay (Summer)';
        if (health >= 25) return 'Concerning (Fall)';
        if (health >= 2) return 'Critical (Winter)';
        return 'Dead';
    };

    return (
        <div className="App">
            <header className="header">
                <h1>👻 Carbon Ghost</h1>
                <p>Real-time carbon footprint visualization</p>
            </header>

            <div className="controls">
                <input
                    type="text"
                    placeholder="Device Address (0x...)"
                    value={deviceAddress}
                    onChange={(e) => setDeviceAddress(e.target.value)}
                    className="address-input"
                />
                <button onClick={handleConnect} className="connect-btn">
                    Connect Device
                </button>
            </div>

            <div className="content">
                <div className="ghost-container">
                    <GhostViewer ghostData={ghostData} />
                </div>

                <div className="stats-panel">
                    <h2>Ghost Stats</h2>
                    {loading && <p>Loading...</p>}
                    {ghostData && (
                        <div className="stats">
                            <div className="stat-item">
                                <span className="label">Season:</span>
                                <span className={`value season-${ghostData.season?.toLowerCase() || 'summer'}`}>
                                    {getSeasonEmoji(ghostData.season)} {ghostData.season || 'Summer'}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Health:</span>
                                <span className="value">{ghostData.health}/100</span>
                                <div className="health-bar">
                                    <div 
                                        className={`health-fill ${getHealthClass(ghostData.health)}`}
                                        style={{ width: `${ghostData.health}%` }}
                                    />
                                </div>
                                <span className="health-label">{getHealthLabel(ghostData.health)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Mood:</span>
                                <span className={`value ${ghostData.mood?.toLowerCase() || 'neutral'}`}>
                                    {ghostData.mood || 'Neutral'}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Deposit:</span>
                                <span className="value">{ghostData.deposit} MATIC</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Green Credits:</span>
                                <span className="value green">{ghostData.greenCredits} 🌿</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Clean Streak:</span>
                                <span className="value streak">{ghostData.consecutiveClean || 0} 🔥</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Last Update:</span>
                                <span className="value small">
                                    {new Date(ghostData.lastUpdate).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    <h2>Grid Status</h2>
                    {gridStatus && (
                        <div className="stats">
                            <div className="stat-item">
                                <span className="label">Status:</span>
                                <span className={`value ${gridStatus.status.toLowerCase()}`}>
                                    {gridStatus.status === 'CLEAN' ? '✅' : '⚠️'} {gridStatus.status}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Carbon Intensity:</span>
                                <span className="value">{gridStatus.carbonIntensity} gCO2/kWh</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
