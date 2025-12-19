import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Wallet, Key, Shield, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useStore } from '../lib/store';

const WalletView = () => {
    const [showKey, setShowKey] = useState(false);
    const { addToast } = useStore.getState();

    const handleCopy = () => {
        navigator.clipboard.writeText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        addToast("Address copied to clipboard", "success");
    };

    return (
        <Layout className="p-6">
            <h1 className="text-2xl font-bold mb-6 mt-4">Digital Wallet</h1>

            <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-blue-500/30 rounded-3xl p-6 mb-8">
                <p className="text-neutral-400 text-sm mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold text-white mb-4">4 Assets</h2>
                <div className="flex items-center gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-xs font-mono text-neutral-300 truncate flex-1">
                        0x71C7...8976F
                    </span>
                    <button onClick={handleCopy} className="p-1 hover:bg-white/10 rounded">
                        <Copy className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>
            </div>

            <h2 className="font-semibold mb-4">Security</h2>
            <div className="space-y-4">
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                    <div className="flex items-center gap-3 mb-4">
                        <Key className="w-6 h-6 text-yellow-500" />
                        <div>
                            <h3 className="font-semibold text-white">Private Key</h3>
                            <p className="text-xs text-neutral-500">Never share this with anyone</p>
                        </div>
                    </div>
                    
                    <div className="bg-black rounded-lg p-3 border border-neutral-800 flex justify-between items-center">
                        <code className="text-xs text-green-500 font-mono break-all mr-2">
                             {showKey ? "e8f32a...982b1c" : "••••••••••••••••••••••••"}
                        </code>
                        <button onClick={() => setShowKey(!showKey)}>
                            {showKey ? <EyeOff className="w-4 h-4 text-neutral-500" /> : <Eye className="w-4 h-4 text-neutral-500" />}
                        </button>
                    </div>
                </div>

                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-green-500" />
                        <div>
                            <h3 className="font-semibold text-white">Recovery Phrase</h3>
                            <p className="text-xs text-neutral-500">Backup your 12-word seed</p>
                        </div>
                    </div>
                    <Button variant="outline" className="h-8 text-xs">View</Button>
                </div>

                 <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="font-semibold text-white">Connected Apps</h3>
                            <p className="text-xs text-neutral-500">2 Active Sessions</p>
                        </div>
                    </div>
                    <Button variant="outline" className="h-8 text-xs">Manage</Button>
                </div>
            </div>
        </Layout>
    );
};

export default WalletView;
