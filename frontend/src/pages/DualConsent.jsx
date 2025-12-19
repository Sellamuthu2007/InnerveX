import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Fingerprint, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const DualConsent = () => {
    const [step, setStep] = useState(1);

    return (
        <Layout className="p-6 flex flex-col justify-center text-center">
            <h1 className="text-2xl font-bold mb-8">Dual-Consent Verification</h1>
            
            <div className="flex justify-center items-center gap-4 mb-12 relative">
                <ConsentStep label="Institution" active={true} done={true} />
                <div className="w-16 h-1 bg-green-500 rounded-full"></div>
                <ConsentStep label="User" active={step >= 2} done={step === 3} />
            </div>

            {step === 1 && (
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl mb-8">
                    <p className="text-sm text-neutral-400 mb-2">Pending Action</p>
                    <h2 className="text-xl font-bold mb-1">Accept Certificate?</h2>
                    <p className="text-xs text-neutral-500 mb-6">Issued by IIT Madras • B.Tech Degree</p>
                    <Button onClick={() => setStep(2)} className="w-full">Review & Sign</Button>
                </div>
            )}

            {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Fingerprint className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-pulse" />
                    <p className="text-neutral-400 mb-8">Verify biometric to sign this certificate on-chain.</p>
                    <Button onClick={() => setStep(3)} className="w-full h-14 rounded-full">Authenticate</Button>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Consensus Reached</h2>
                    <p className="text-neutral-400 mb-8">Certificate is now locked and immutable.</p>
                </motion.div>
            )}
        </Layout>
    );
};

const ConsentStep = ({ label, active, done }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${done ? 'bg-green-500 border-green-500' : active ? 'border-primary text-white' : 'border-neutral-800 text-neutral-600'}`}>
            {done ? <CheckCircle2 className="text-black" /> : <div className="w-3 h-3 bg-current rounded-full" />}
        </div>
        <span className={`text-xs ${active ? 'text-white' : 'text-neutral-600'}`}>{label}</span>
    </div>
);

export default DualConsent;
