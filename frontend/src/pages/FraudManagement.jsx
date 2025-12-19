import React from 'react';
import Layout from '../components/Layout';
import { ShieldAlert, Ban, AlertTriangle } from 'lucide-react';
import { useStore } from '../lib/store';

const FraudManagement = () => {
    return (
        <Layout className="bg-red-950/10 p-6">
             <div className="flex items-center gap-3 mb-8 mt-6">
                <ShieldAlert className="w-8 h-8 text-red-500" />
                <h1 className="font-bold text-xl text-red-100">Fraud Management</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-red-900/20 border border-red-900/40 p-4 rounded-2xl">
                    <p className="text-2xl font-bold text-red-500">3</p>
                    <p className="text-xs text-red-300">Flagged Users</p>
                </div>
                <div className="bg-red-900/20 border border-red-900/40 p-4 rounded-2xl">
                    <p className="text-2xl font-bold text-red-500">12</p>
                    <p className="text-xs text-red-300">Rejected Certs</p>
                </div>
            </div>

            <h2 className="font-semibold mb-4 text-red-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Live Alerts
            </h2>
            
            <div className="space-y-3">
                <div className="bg-neutral-900 border border-red-900/30 p-4 rounded-2xl flex gap-4">
                    <Ban className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-white">Fake Institution Detected</p>
                        <p className="text-xs text-neutral-400 mt-1">"Best IT Academy" attempted to issue 50 certificates without accreditation.</p>
                        <div className="mt-2 flex gap-2">
                            <button 
                                onClick={() => useStore.getState().addToast('Institution blocked successfully', 'error')}
                                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full transition-colors"
                            >
                                Block
                            </button>
                            <button 
                                onClick={() => useStore.getState().addToast('Investigation case #402 created', 'info')}
                                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-3 py-1 rounded-full transition-colors"
                            >
                                Investigate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FraudManagement;
