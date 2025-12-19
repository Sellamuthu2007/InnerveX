import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScanLine, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PublicVerification = () => {
    const [certId, setCertId] = useState('');
    const [result, setResult] = useState(null);

    const handleVerify = () => {
        setResult('verified'); // Mock result
    };

    return (
        <Layout className="p-6 pt-12">
            <div className="max-w-xs mx-auto text-center mb-12">
                <div className="w-16 h-16 bg-neutral-900 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-neutral-800">
                    <ScanLine className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Verify Any Certificate</h1>
                <p className="text-neutral-400">Instantly check authenticity on the blockchain.</p>
            </div>

            <div className="space-y-4 mb-8">
                <Input 
                    placeholder="Enter Certificate ID / Hash" 
                    className="h-14 bg-neutral-900 border-neutral-700 font-mono text-center"
                    value={certId}
                    onChange={e => setCertId(e.target.value)}
                />
                <Button 
                    className="w-full h-14 rounded-full text-lg" 
                    disabled={!certId}
                    onClick={handleVerify}
                >
                    Verify Now
                </Button>
                
                <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-neutral-800"></div>
                    <span className="flex-shrink-0 mx-4 text-neutral-600 text-xs">OR SCAN QR</span>
                    <div className="flex-grow border-t border-neutral-800"></div>
                </div>

                <Button variant="outline" className="w-full h-14 rounded-full">
                    Open Camera Scanner
                </Button>
            </div>

            {result === 'verified' && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-900/10 border border-green-900/30 p-6 rounded-3xl text-center"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-500 mb-1">Valid Certificate</h3>
                    <p className="text-white font-medium mb-1">Bachelor of Technology</p>
                    <p className="text-sm text-neutral-400">Issued by IIT Madras • 2024</p>
                </motion.div>
            )}
        </Layout>
    );
};

export default PublicVerification;
