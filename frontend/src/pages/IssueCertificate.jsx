import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Upload, Fingerprint, FileText, X, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';
import { motion, AnimatePresence } from 'framer-motion';

const IssueCertificate = () => {
    const navigate = useNavigate();
    const { addToast, addCertificate, name } = useStore();
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState({ title: '', recipientName: '', recipientEmail: '' });
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleNameCheck = async () => {
        if (!metadata.recipientName) return;
        
        try {
            const res = await fetch(`${API_URL}/api/verify-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: metadata.recipientName })
            });
            const data = await res.json();

            if (data.success) {
                setMetadata(prev => ({ ...prev, recipientEmail: data.email, recipientName: data.name }));
                addToast(`User verified: ${data.name}`, 'success');
                
                // Trigger Frontend OTP Logic (Visual)
                await fetch(`${API_URL}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: data.email })
                });

                addToast(`OTP sent to ${data.email}`, 'info');
                setStep(2);
            } else {
                addToast('User not registered. Cannot issue.', 'error');
            }
        } catch (error) {
            addToast('Error connecting to registry', 'error');
            console.error(error);
        }
    };

    const handleVerifyOtp = () => {
        if (otp !== '123456') { 
            addToast('Invalid OTP', 'error');
            return;
        }
        addToast('Identity Verified Successfully', 'success');
        setStep(3);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            addToast(`File "${droppedFile.name}" selected`, 'info');
        }
    };

    const handleIssue = () => {
        setIsVerifying(true);
        // Simulate Verification & Blockchain Minting
        setTimeout(() => {
            setIsVerifying(false);
            
            // Add to store
            addCertificate({
                id: `cert_${Date.now()}`,
                title: metadata.title,
                issuer: name || 'Unknown Institution',
                recipient: metadata.recipientName,
                date: new Date().toISOString().split('T')[0],
                status: 'verified',
                type: 'uploaded'
            });

            setStep(4);
            addToast('Certificate minted and transferred!', 'success');
        }, 2500);
    };
    
    // ... formatAadhar ...

    const formatAadhar = (val) => {
        // Simple formatter for visibility XXXX XXXX XXXX
        const v = val.replace(/\D/g, '').substring(0, 12);
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        return parts.join(' ');
    };

    return (
        <Layout className="p-6">
            <div className="flex justify-between items-center mb-6 mt-4">
                <h1 className="text-2xl font-bold">Issue Certificate</h1>
                <Button variant="ghost" size="icon" onClick={() => navigate('/institution-dashboard')}>
                    <X className="w-6 h-6" />
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-8 pt-4"
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-900/20 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-blue-500/30">
                                <Fingerprint className="w-10 h-10 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Recipient Lookup</h2>
                            <p className="text-neutral-400 text-sm">
                                Enter the user's Full Name to verify they are registered in the system.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm text-neutral-500 ml-1 block">Recipient Name</label>
                            <Input 
                                placeholder="e.g. Rahul Sellamuthu" 
                                className="h-16 bg-neutral-900 border-neutral-800 text-center text-xl"
                                value={metadata.recipientName}
                                onChange={e => setMetadata({...metadata, recipientName: e.target.value})}
                            />
                        </div>

                        <Button 
                            className="w-full h-14 rounded-full text-lg" 
                            disabled={!metadata.recipientName}
                            onClick={handleNameCheck}
                        >
                            Verify User & Send OTP
                        </Button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 pt-4"
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-900/20 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-purple-500/30">
                                <Mail className="w-10 h-10 text-purple-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Verify Recipient</h2>
                            <p className="text-neutral-400 text-sm">
                                We've sent a 6-digit code to <strong>{metadata.recipientEmail}</strong>. Enter it below to verify.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Input 
                                placeholder="000 000" 
                                className="h-16 bg-neutral-900 border-neutral-800 text-center text-2xl tracking-[0.5em] font-mono"
                                value={otp}
                                maxLength={6}
                                onChange={e => setOtp(e.target.value)}
                            />
                            <p className="text-xs text-center text-neutral-500">
                                Didn't receive code? <span className="text-blue-500 cursor-pointer">Resend</span>
                            </p>
                        </div>

                        <Button 
                            className="w-full h-14 rounded-full text-lg" 
                            disabled={otp.length < 6}
                            onClick={handleVerifyOtp}
                        >
                            Verify & Continue
                        </Button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                         <h2 className="text-xl font-bold text-center mb-4">Upload Certificate Details</h2>
                        
                        {/* File Upload Zone */}
                        <div 
                            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-colors ${file ? 'border-green-500 bg-green-900/10' : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900'}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                        >
                            {file ? (
                                <div>
                                    <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <p className="font-medium text-white break-all">{file.name}</p>
                                    <button onClick={() => setFile(null)} className="text-xs text-red-500 mt-4 hover:underline">Remove</button>
                                </div>
                            ) : (
                                <div>
                                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="font-medium text-white">Upload Certificate</p>
                                    <p className="text-xs text-neutral-500 mt-1">Drag & drop or Click</p>
                                    <input type="file" className="hidden" id="file-upload" onChange={handleFileDrop} />
                                    <label htmlFor="file-upload" className="block mt-4 text-sm text-blue-500 cursor-pointer">Browse Files</label>
                                </div>
                            )}
                        </div>

                        {/* Metadata Form */}
                        <div className="space-y-4">
                            <Input 
                                placeholder="Certificate / Course Name" 
                                className="h-12 bg-neutral-900 border-neutral-800"
                                value={metadata.title}
                                onChange={e => setMetadata({...metadata, title: e.target.value})}
                            />
                            <div className="grid grid-cols-1 gap-4">
                                <Input 
                                    className="h-12 bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed"
                                    value={metadata.recipientName}
                                    readOnly
                                />
                            </div>
                        </div>

                         <Button 
                            className="w-full h-14 rounded-full text-lg" 
                            disabled={!file || !metadata.title}
                            onClick={handleIssue}
                        >
                            {isVerifying ? 'Minting...' : 'Complete Issuance'}
                        </Button>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center pt-12"
                    >
                        <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Certificate Issued!</h2>
                        <p className="text-neutral-400 mb-8">
                            Successfully bound to <strong>{metadata.recipientName}</strong>.
                        </p>
                        <Button onClick={() => navigate('/institution-dashboard')} className="w-full rounded-full h-12">
                            Return to Dashboard
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default IssueCertificate;
