import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Building2, Search, CheckCircle2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';

const RequestCertificateFlow = () => {
    const navigate = useNavigate();
    const addRequest = useStore(state => state.addRequest);
    const [institution, setInstitution] = useState('');
    const [certType, setCertType] = useState('');
    const [status, setStatus] = useState('input'); // input, sending, success

    const handleRequest = (e) => {
        e.preventDefault();
        setStatus('sending');
        
        setTimeout(() => {
            addRequest({
                id: `req_${Date.now()}`,
                title: certType,
                institution: institution,
                status: 'sent',
                date: new Date().toISOString().split('T')[0]
            });
            setStatus('success');
            useStore.getState().addToast('Certificate request sent successfully!', 'success');
        }, 1500);
    };

    if (status === 'success') {
        return (
            <Layout className="flex items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Request Sent!</h2>
                    <p className="text-neutral-400 mb-8">
                        Wait for {institution} to verify and issue your certificate.
                    </p>
                    <Button onClick={() => navigate('/dashboard')} className="w-full rounded-full h-12">
                        Back to Home
                    </Button>
                </motion.div>
            </Layout>
        );
    }

    return (
        <Layout className="p-6">
            <h1 className="text-2xl font-bold mb-6 mt-4">Request Certificate</h1>
            
            <form onSubmit={handleRequest} className="space-y-6">
                <div className="space-y-4">
                    <label className="text-sm text-neutral-400 ml-1">Search Institution</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input 
                            placeholder="e.g. IIT Madras, Coursera" 
                            className="pl-12"
                            value={institution}
                            onChange={e => setInstitution(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm text-neutral-400 ml-1">Certificate Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Degree', 'Diploma', 'Course', 'Skill Badge'].map((type) => (
                            <div 
                                key={type}
                                onClick={() => setCertType(type)}
                                className={`p-4 rounded-xl border cursor-pointer text-center text-sm font-medium transition-colors ${certType === type ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'}`}
                            >
                                {type}
                            </div>
                        ))}
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-14 rounded-full mt-8 text-lg"
                    disabled={!institution || !certType || status === 'sending'}
                >
                    {status === 'sending' ? 'Sending Request...' : 'Send Request'}
                </Button>
            </form>
        </Layout>
    );
};

export default RequestCertificateFlow;
