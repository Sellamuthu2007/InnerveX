import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStore } from '../lib/store';
import { Loader2 } from 'lucide-react';
import { API_URL } from '../lib/config';

const IndividualRegistration = () => {
  const navigate = useNavigate();
  const setUser = useStore(state => state.setUser);
  const setToken = useStore(state => state.setToken);
  const addToast = useStore(state => state.addToast);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: ''
  });

  const [walletId, setWalletId] = useState('');

  useEffect(() => {
    // Simulate wallet ID generation
    setWalletId('0x' + Math.random().toString(16).substr(2, 8).toUpperCase());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'individual',
          walletId  // send the wallet ID generated on screen
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);  // persist JWT right after signup
        addToast('Account created successfully!', 'success');
        navigate('/dashboard');
      } else {
        addToast(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      addToast('Failed to connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="p-6">
      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-neutral-400">Join the trust network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400 ml-1 mb-1 block">Full Name</label>
            <Input 
              required
              placeholder="e.g. Rahul S"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 ml-1 mb-1 block">Email</label>
            <Input 
              required
              type="email"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 ml-1 mb-1 block">Password</label>
            <Input 
              required
              type="password"
              placeholder="Enter a secure password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 ml-1 mb-1 block">Mobile Number</label>
            <Input 
              required
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            />
          </div>
          
          <div className="pt-2">
            <label className="text-xs text-neutral-500 ml-1 mb-1 block uppercase tracking-wider">Your Unique Wallet ID</label>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center font-mono text-primary tracking-widest text-lg select-all">
              {walletId}
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-2xl">
          <p className="text-blue-400 text-sm text-center">
            Note: You cannot upload certificates yourself. Only authorized institutions can issue them to your wallet.
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 text-lg rounded-full mt-8"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Create Wallet & Continue'}
        </Button>
      </form>
    </Layout>
  );
};

export default IndividualRegistration;
