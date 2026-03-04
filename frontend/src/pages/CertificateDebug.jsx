import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const CertificateDebug = () => {
    const { certificates, token, user, fetchMyCertificates } = useStore();
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDirect = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/v1/certificates/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setApiResponse(data);
        } catch (error) {
            setApiResponse({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDirect();
    }, []);

    return (
        <Layout className="p-6">
            <h1 className="text-2xl font-bold mb-6">Certificate Debug Page</h1>

            {/* User Info */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4">User Information</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Name:</span>
                        <span className="font-mono">{user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Email:</span>
                        <span className="font-mono">{user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Role:</span>
                        <span className="font-mono">{user?.role || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Token:</span>
                        <span className="font-mono text-xs">{token ? `${token.substring(0, 20)}...` : 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Store Certificates */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Store Certificates ({certificates.length})</h2>
                    <Button size="sm" onClick={fetchMyCertificates} className="rounded-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
                {certificates.length === 0 ? (
                    <p className="text-neutral-500 text-sm">No certificates in store</p>
                ) : (
                    <div className="space-y-3">
                        {certificates.map((cert, index) => (
                            <div key={cert.id} className="bg-neutral-950 rounded-lg p-4 border border-neutral-800">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold">{cert.title}</p>
                                        <p className="text-xs text-neutral-500">ID: {cert.id}</p>
                                    </div>
                                    {cert.status === 'verified' ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-neutral-500">Status:</span>
                                        <span className="ml-2 font-mono">{cert.status}</span>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Type:</span>
                                        <span className="ml-2 font-mono">{cert.type || 'undefined'}</span>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Issuer:</span>
                                        <span className="ml-2 font-mono">{cert.issuer}</span>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Date:</span>
                                        <span className="ml-2 font-mono">{cert.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* API Response */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Direct API Response</h2>
                    <Button size="sm" onClick={fetchDirect} disabled={loading} className="rounded-full">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Fetch
                    </Button>
                </div>
                {apiResponse ? (
                    <pre className="bg-neutral-950 rounded-lg p-4 text-xs overflow-auto max-h-96 border border-neutral-800">
                        {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                ) : (
                    <p className="text-neutral-500 text-sm">Click Fetch to load API response</p>
                )}
            </div>

            {/* Shareable Check */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-5 mt-6">
                <h2 className="text-lg font-semibold mb-4">Shareable Certificates</h2>
                {certificates.filter(cert => cert.status === 'verified' && (cert.type === 'received' || !cert.type)).length === 0 ? (
                    <p className="text-neutral-400 text-sm">No shareable certificates found</p>
                ) : (
                    <div className="space-y-2">
                        {certificates
                            .filter(cert => cert.status === 'verified' && (cert.type === 'received' || !cert.type))
                            .map(cert => (
                                <div key={cert.id} className="bg-blue-950/50 rounded-lg p-3 border border-blue-800">
                                    <p className="font-semibold text-sm">{cert.title}</p>
                                    <p className="text-xs text-blue-400">✓ Can be shared</p>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CertificateDebug;
