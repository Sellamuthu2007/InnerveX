import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { setUser, addToast } = useStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                setUser(data.user);
                addToast('Login successful', 'success');
                
                // Role-based redirection
                if (data.user.role === 'institution') {
                    navigate('/institution-dashboard');
                } else if (data.user.role === 'employer') {
                    navigate('/employer-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                addToast(data.message, 'error');
            }
        } catch (error) {
            addToast('Server connection failed. Ensure server is running.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="bg-black p-6 justify-center">
            <div className="mb-12 text-center">
                <div className="w-16 h-16 bg-blue-900/20 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-blue-500/30">
                    <Lock className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                <p className="text-neutral-400">Access your certificate wallet</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                   <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input 
                            placeholder="Email Address" 
                            className="pl-12 h-14 bg-neutral-900 border-neutral-800"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input 
                            type="password"
                            placeholder="Password" 
                            className="pl-12 h-14 bg-neutral-900 border-neutral-800"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            required
                        />
                   </div>
                </div>
                
                <Button 
                    type="submit" 
                    className="w-full h-14 rounded-full text-lg mt-4"
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Sign In'} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </form>

            <p className="text-center text-neutral-500 mt-8">
                Don't have an account? <Link to="/signup" className="text-blue-500 font-semibold hover:underline">Sign Up</Link>
            </p>
        </Layout>
    );
};

export default Login;
