import React, { useState, useEffect } from 'react';
import { masterService, salesService } from '../services/api';

const SalesOrderForm = ({ onSuccess }) => {
    const [products, setProducts] = useState([]);
    const [customer, setCustomer] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [qty, setQty] = useState('');
    const [lastOrder, setLastOrder] = useState(null);

    useEffect(() => {
        masterService.getProducts().then(res => setProducts(res.data));
    }, []);

    const handleOrder = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                customer_name: customer,
                items: [
                    {
                        product_id: parseInt(selectedProduct),
                        quantity: parseInt(qty),
                        unit_price: 100.0 // Hardcoded for MVP
                    }
                ]
            };

            const response = await salesService.createOrder(payload);
            setLastOrder(response.data);
            alert("✅ Order Allocated Successfully!");
            
            // Clear inputs
            setQty('');
            
            // Refresh Inventory UI
            if (onSuccess) onSuccess();

        } catch (error) {
            alert("❌ Order Failed! " + (error.response?.data?.detail || "Check console"));
            console.error(error);
        }
    };

    return (
        <div className="glass-panel" style={{ border: '1px solid #10b981' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#34d399' }}>⬆ Outbound / Dispatch</h3>

            <form onSubmit={handleOrder} style={{ display: 'grid', gap: '15px' }}>
                
                {/* Customer Name */}
                <div>
                    <input 
                        type="text" placeholder="Customer / Hospital Name"
                        value={customer} onChange={e => setCustomer(e.target.value)}
                        style={{ width: '90%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                    {/* Product Select */}
                    <select 
                        value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                        style={{ padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                        required
                    >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    {/* Quantity */}
                    <input 
                        type="number" placeholder="Qty"
                        value={qty} onChange={e => setQty(e.target.value)}
                        style={{ padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    style={{ width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ⚡ Dispatch Order
                </button>
            </form>

            {/* Allocation Result Display */}
            {lastOrder && (
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', fontSize: '0.9rem' }}>
                    <strong>Latest Allocation:</strong><br/>
                    Order #{lastOrder.id} - {lastOrder.status}
                </div>
            )}
        </div>
    );
};

export default SalesOrderForm;