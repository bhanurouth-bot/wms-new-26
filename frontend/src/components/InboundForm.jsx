import React, { useState, useEffect } from 'react';
import { masterService, inventoryService } from '../services/api';

const InboundForm = ({ onSuccess }) => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_id: '',
        batch_number: '',
        expiry_date: '',
        mfg_date: new Date().toISOString().split('T')[0], // Default today
        mrp: '',
        quantity: '',
        target_bin_code: 'A-01-01' // Default bin for now
    });

    useEffect(() => {
        // Load products for the dropdown
        masterService.getProducts().then(res => setProducts(res.data));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert types before sending
            const payload = {
                ...formData,
                product_id: parseInt(formData.product_id),
                quantity: parseInt(formData.quantity),
                mrp: parseFloat(formData.mrp)
            };
            
            await inventoryService.receiveStock(payload);
            alert("✅ Stock Received Successfully!");
            
            // Clear specific fields
            setFormData({ ...formData, batch_number: '', quantity: '' });
            
            // Trigger refresh in parent
            if (onSuccess) onSuccess();
            
        } catch (error) {
            alert("❌ Failed to receive stock. Check console.");
            console.error(error);
        }
    };

    return (
        <div className="glass-panel" style={{ marginBottom: '30px', border: '1px solid #3b82f6' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#60a5fa' }}>⬇ Inbound / Goods Receipt</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                
                {/* Product Select */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Product</label>
                    <select 
                        name="product_id" 
                        onChange={handleChange} 
                        style={{ padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                        required
                    >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku_code})</option>
                        ))}
                    </select>
                </div>

                {/* Batch Number */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Batch Number</label>
                    <input 
                        type="text" name="batch_number" placeholder="e.g. BATCH-001"
                        value={formData.batch_number} onChange={handleChange}
                        style={{ padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                        required
                    />
                </div>

                {/* Expiry Date */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Expiry Date</label>
                    <input 
                        type="date" name="expiry_date"
                        value={formData.expiry_date} onChange={handleChange}
                        style={{ padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                        required
                    />
                </div>

                {/* Quantity */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Quantity</label>
                    <input 
                        type="number" name="quantity" placeholder="Qty"
                        value={formData.quantity} onChange={handleChange}
                        style={{ padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                        required
                    />
                </div>

                {/* MRP */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>MRP</label>
                    <input 
                        type="number" name="mrp" placeholder="0.00"
                        value={formData.mrp} onChange={handleChange}
                        style={{ padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                        required
                    />
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', alignItems: 'end' }}>
                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Receive Stock
                    </button>
                </div>

            </form>
        </div>
    );
};

export default InboundForm;