import React, { useEffect, useState } from 'react';
import { masterService } from '../services/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await masterService.getProducts();
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="glass-panel">Loading...</div>;

    return (
        <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontWeight: 500 }}>📦 Master Inventory</h2>
                <button className="badge badge-blue" style={{ cursor: 'pointer' }}>+ Add Product</button>
            </div>
            
            <table className="glass-table">
                <thead>
                    <tr>
                        <th>SKU Code</th>
                        <th>Product Name</th>
                        <th>Composition</th>
                        <th>Storage</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td style={{ color: '#fff', fontWeight: 'bold' }}>{product.sku_code}</td>
                            <td>
                                {product.name}
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{product.manufacturer?.name || "Unknown Vendor"}</div>
                            </td>
                            <td style={{ color: '#94a3b8' }}>{product.composition}</td>
                            <td>
                                {product.requires_cold_chain ? 
                                    <span className="badge badge-blue">❄ Cold Chain</span> : 
                                    <span className="badge badge-gray">Ambient</span>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;