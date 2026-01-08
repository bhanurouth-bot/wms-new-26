import React, { useEffect, useState } from 'react';
import { inventoryService } from '../services/api';

const InventoryDashboard = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await inventoryService.getLiveStock();
            setStock(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
            setLoading(false);
        }
    };

    // Helper: Logic to determine if stock is expiring
    const getExpiryStatus = (dateString) => {
        const today = new Date();
        const expiry = new Date(dateString);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) return { label: 'CRITICAL', color: 'badge-red' };
        if (diffDays < 90) return { label: 'WARNING', color: 'badge-yellow' };
        return { label: 'GOOD', color: 'badge-green' };
    };

    if (loading) return <div className="glass-panel">Syncing Warehouse...</div>;

    return (
        <div className="glass-panel" style={{ marginTop: '20px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontWeight: 500 }}>🏭 Live Warehouse Floor</h2>
            
            <table className="glass-table">
                <thead>
                    <tr>
                        <th>Bin Location</th>
                        <th>Product</th>
                        <th>Batch #</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {stock.length === 0 ? (
                        <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Warehouse is Empty</td></tr>
                    ) : (
                        stock.map((item, index) => {
                            const status = getExpiryStatus(item.expiry_date);
                            return (
                                <tr key={index}>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', color: '#60a5fa' }}>{item.bin_code}</span>
                                        {item.is_cold_chain && <span style={{marginLeft: '8px'}}>❄</span>}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{item.product_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.sku}</div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace' }}>{item.batch_number}</td>
                                    <td>{item.expiry_date}</td>
                                    <td>
                                        <span className={`badge`} 
                                            style={
                                                status.color === 'badge-red' ? {background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)'} : 
                                                status.color === 'badge-yellow' ? {background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)'} :
                                                {background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)'}
                                            }>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>
                                        {item.quantity}
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryDashboard;