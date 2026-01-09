import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Placeholder images for the carousel (Warehouse, Lab, Logistics)
const IMAGES = [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop', // Warehouse
    'https://images.unsplash.com/photo-1579165466741-7f35a4755657?q=80&w=2070&auto=format&fit=crop', // Lab/Pharma
    'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070&auto=format&fit=crop'  // Logistics
];

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    // Carousel Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % IMAGES.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // We use URLSearchParams because OAuth2PasswordRequestForm expects form data, not JSON
            const formData = new URLSearchParams();
            formData.append('username', email); // FastAPI expects 'username', even if it's an email
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // If successful, save token and notify parent
            const token = response.data.access_token;
            localStorage.setItem('token', token); // Save to browser
            onLoginSuccess(token);

        } catch (err) {
            console.error("Login Error", err);
            setError('Invalid credentials. Access Denied.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
            
            {/* BACKGROUND CAROUSEL */}
            {IMAGES.map((img, index) => (
                <div 
                    key={index}
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundImage: `url(${img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: currentImage === index ? 1 : 0,
                        transition: 'opacity 1.5s ease-in-out',
                        filter: 'brightness(0.4) contrast(1.2)' // Darken for readability
                    }}
                />
            ))}

            {/* GLASS LOGIN CARD */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
                        Pharma<span style={{ color: '#3b82f6' }}>OS</span>
                    </h1>
                    <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Secure Enterprise Gateway</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input 
                        type="email" 
                        placeholder="ID / Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            padding: '14px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border 0.3s'
                        }}
                    />

                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            padding: '14px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '5px' }}>⚠ {error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            marginTop: '10px',
                            padding: '14px',
                            background: loading ? '#475569' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Enter System →'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#64748b' }}>
                    Restricted Access • Authorized Personnel Only
                </div>
            </div>
        </div>
    );
};

export default Login;