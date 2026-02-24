import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';

const CertificateRevocation = () => {
    const [certId, setCertId] = useState('');
    const [isRevoked, setIsRevoked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { revokeCertificate } = useStore();

    const handleRevoke = async () => {
        setIsLoading(true);
        const success = await revokeCertificate(certId);
        setIsLoading(false);
        if (success) {
            setIsRevoked(true);
        }
    };

    if (isRevoked) {
        return (
            <Layout className="flex items-center justify-center p-6 text-center bg-red-950/20">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <ShieldAlert className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Certificate Revoked</h2>
                    <p className="text-neutral-400 mb-8">
                        The certificate has been permanently invalidated on the blockchain.
                    </p>
                    <Button variant="outline" onClick={() => setIsRevoked(false)} className="w-full">
                        Close
                    </Button>
                </motion.div>
            </Layout>
        );
    }

    return (
        <Layout className="p-6 border-t-4 border-red-900">
            <h1 className="text-2xl font-bold mb-6 mt-4 text-red-500 flex items-center gap-2">
                <AlertTriangle /> Revocation Console
            </h1>
            
            <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-2xl mb-8">
                <p className="text-sm text-red-200">
                    Warning: This action is irreversible. The certificate will be marked as INVALID globally.
                </p>
            </div>

            <div className="space-y-6">
                <div>
                     <label className="text-sm text-neutral-400 ml-1">Certificate ID</label>
                     <Input 
                        placeholder="Paste Certificate ID" 
                        value={certId}
                        onChange={e => setCertId(e.target.value)}
                        className="border-red-900/30 focus-visible:ring-red-900"
                     />
                </div>
                <div>
                     <label className="text-sm text-neutral-400 ml-1">Reason for Revocation</label>
                     <Input placeholder="e.g. Fraud, Expired, Issued by mistake" />
                </div>
                
                <Button 
                    onClick={handleRevoke}
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white mt-8"
                    disabled={!certId || isLoading}
                >
                    {isLoading ? 'Revoking...' : 'Permanently Revoke'}
                </Button>
            </div>
        </Layout>
    );
};

export default CertificateRevocation;
