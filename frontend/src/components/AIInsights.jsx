import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/api';

const AIInsights = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await analyticsService.getInsights();
            setInsights(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) return null; // Don't show anything while loading
    if (insights.length === 0) return null; // Don't show if everything is perfect

    return (
        <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#c084fc' }}>🔮 AI Forecasts & Alerts</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {insights.map((insight, idx) => (
                    <div key={idx} className="glass-panel" style={{ 
                        borderLeft: insight.type === 'CRITICAL' ? '4px solid #ef4444' : 
                                    insight.type === 'WARNING' ? '4px solid #fbbf24' : 
                                    '4px solid #60a5fa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 'bold', 
                                color: insight.type === 'CRITICAL' ? '#f87171' : 
                                       insight.type === 'WARNING' ? '#fbbf24' : '#93c5fd',
                                marginBottom: '5px'
                            }}>
                                {insight.type === 'CRITICAL' ? '⚡ CRITICAL' : insight.title.toUpperCase()}
                            </div>
                            <div style={{ color: '#e2e8f0' }}>{insight.message}</div>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                            {insight.metric}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AIInsights;