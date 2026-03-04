import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Share2, Eye, Calendar, User, Mail, Shield, FileText, Clock, ExternalLink } from 'lucide-react';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';

const SharedCertificates = () => {
    const navigate = useNavigate();
    const { addToast, token } = useStore();
    const [sharedCerts, setSharedCerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, expired

    useEffect(() => {
        fetchSharedCertificates();
    }, []);

    const fetchSharedCertificates = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/v1/shares/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch shared certificates');
            }

            const data = await response.json();
            setSharedCerts(data.shares || []);
        } catch (error) {
            console.error('Error fetching shared certificates:', error);
            addToast(error.message || 'Failed to load shared certificates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewCertificate = (cert) => {
        navigate(`/certificate/${cert.id}`);
    };

    const isExpired = (expiresAt) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    const getDaysUntilExpiry = (expiresAt) => {
        if (!expiresAt) return null;
        const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const filteredCerts = sharedCerts.filter(cert => {
        if (filter === 'active') return !isExpired(cert.expiresAt);
        if (filter === 'expired') return isExpired(cert.expiresAt);
        return true;
    });

    return (
        <Layout className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Share2 className="w-7 h-7 text-purple-400" />
                    Shared Certificates
                </h1>
                <p className="text-neutral-400 text-sm">
                    Certificates that have been shared with you by other individuals
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                        filter === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                >
                    All ({sharedCerts.length})
                </Button>
                <Button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                        filter === 'active'
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                >
                    Active ({sharedCerts.filter(c => !isExpired(c.expiresAt)).length})
                </Button>
                <Button
                    onClick={() => setFilter('expired')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                        filter === 'expired'
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                >
                    Expired ({sharedCerts.filter(c => isExpired(c.expiresAt)).length})
                </Button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-neutral-400">Loading shared certificates...</div>
                </div>
            ) : filteredCerts.length === 0 ? (
                <div className="bg-neutral-900 rounded-xl p-12 text-center border border-neutral-800">
                    <Share2 className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Shared Certificates</h3>
                    <p className="text-neutral-400 text-sm">
                        {filter === 'all' 
                            ? 'No certificates have been shared with you yet.' 
                            : `No ${filter} shared certificates found.`}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredCerts.map((cert) => {
                        const expired = isExpired(cert.expiresAt);
                        const daysLeft = getDaysUntilExpiry(cert.expiresAt);
                        
                        return (
                            <div
                                key={cert.shareId}
                                className={`bg-neutral-900 rounded-xl p-6 border transition-all hover:border-purple-600 ${
                                    expired ? 'border-red-800 opacity-60' : 'border-neutral-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            <h3 className="text-lg font-semibold">{cert.title}</h3>
                                            {expired && (
                                                <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full">
                                                    Expired
                                                </span>
                                            )}
                                            {!expired && cert.expiresAt && daysLeft <= 7 && (
                                                <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">
                                                    Expires in {daysLeft} days
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <Shield className="w-4 h-4" />
                                                <span>Issued by: <span className="text-white">{cert.issuer}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <User className="w-4 h-4" />
                                                <span>Recipient: <span className="text-white">{cert.recipient}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <Share2 className="w-4 h-4 text-purple-400" />
                                                <span>Shared by: <span className="text-purple-300">{cert.sharedBy}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-xs">{cert.sharedByEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>Shared on: {new Date(cert.date).toLocaleDateString()}</span>
                                            </div>
                                            {cert.expiresAt && (
                                                <div className="flex items-center gap-2 text-neutral-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        Access expires: {new Date(cert.expiresAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            onClick={() => handleViewCertificate(cert)}
                                            disabled={expired}
                                            className={`flex items-center gap-2 ${
                                                expired 
                                                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
                                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                            }`}
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Certificate
                                        </Button>
                                        
                                        {cert.status === 'verified' && !expired && (
                                            <span className="flex items-center gap-1 text-green-400 text-xs justify-center">
                                                <Shield className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Certificate Hash */}
                                <div className="mt-4 pt-4 border-t border-neutral-800">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-500">Certificate Hash:</span>
                                        <code className="text-neutral-400 font-mono bg-neutral-800 px-2 py-1 rounded">
                                            {cert.id.substring(0, 16)}...
                                        </code>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
};

export default SharedCertificates;
