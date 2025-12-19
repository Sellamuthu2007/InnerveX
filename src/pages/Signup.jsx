import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStore } from '../lib/store';
import { UserPlus, User, Mail, Lock, ArrowRight, Building2, Briefcase } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'individual';
    
    const { setUser, addToast } = useStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    // Dynamic Content based on Role
    const getRoleContent = () => {
        switch(role) {
            case 'institution': return { label: 'Organization Name', icon: Building2, redirect: '/institution-dashboard' };
            case 'employer': return { label: 'Company Name', icon: Briefcase, redirect: '/employer-dashboard' };
            default: return { label: 'Full Name', icon: User, redirect: '/dashboard' };
        }
    };
    const roleContent = getRoleContent();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role })
            });
            const data = await res.json();
            
            if (res.ok) {
                setUser(data.user);
                addToast('Account created successfully', 'success');
                addToast('Account created successfully', 'success');
                navigate(roleContent.redirect);
            } else {
                addToast(data.message, 'error');
            }
        } catch (error) {
            addToast('Server connection failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="bg-black p-6 justify-center">
            <div className="mb-12 text-center">
                <div className="w-16 h-16 bg-blue-900/20 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-blue-500/30">
                    <UserPlus className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-neutral-400">Join the decentralized network</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                 <div className="space-y-2">
                    <div className="relative">
                        <roleContent.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input 
                            placeholder={roleContent.label} 
                            className="pl-12 h-14 bg-neutral-900 border-neutral-800"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                   </div>
                </div>
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
                    {loading ? 'Creating Wallet...' : 'Get Started'} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </form>

            <p className="text-center text-neutral-500 mt-8">
                Already have an account? <Link to="/login" className="text-blue-500 font-semibold hover:underline">Log In</Link>
            </p>
        </Layout>
    );
};

export default Signup;
