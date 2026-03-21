import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
    Shield, ShieldCheck, Building2, User, Calendar, Hash, 
    ExternalLink, Download, Share2, Eye, Clock, MapPin, 
    Loader2, AlertCircle, CheckCircle2, Copy 
} from 'lucide-react';
import { API_URL } from '../lib/config';

const SharedView = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [shareInfo, setShareInfo] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        fetchSharedCertificate();
    }, [token]);

    const fetchSharedCertificate = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_URL}/api/v1/shares/public/${token}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load certificate');
            }

            setCertificate(data.certificate);
            setShareInfo(data.shareInfo);
        } catch (err) {
            console.error('Error fetching shared certificate:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const downloadCertificate = () => {
        if (certificate?.fileData) {
            const link = document.createElement('a');
            link.href = certificate.fileData;
            link.download = certificate.fileName || `${certificate.title}.pdf`;
            link.click();
        }
    };

    const getTimeRemaining = () => {
        if (!shareInfo?.expiresAt) return null;
        const now = new Date();
        const expiry = new Date(shareInfo.expiresAt);
        const diff = expiry - now;
        
        if (diff <= 0) return 'Expired';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
        return 'Expiring soon';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-neutral-400">Loading certificate...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-3">Access Error</h2>
                    <p className="text-neutral-400 mb-6">{error}</p>
                    <Button 
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8" />
                            <div>
                                <h1 className="text-xl font-bold">InnerveX DigiBank</h1>
                                <p className="text-sm text-blue-100">Shared Certificate</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="bg-white/10 hover:bg-white/20 border-white/20"
                        >
                            Home
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Share Info Banner */}
                <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-300">
                                <strong className="text-white">{shareInfo?.sharedBy}</strong> shared this certificate with you
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Shared {new Date(shareInfo?.sharedAt).toLocaleDateString()}
                                </span>
                                {shareInfo?.expiresAt && (
                                    <span className="flex items-center gap-1 text-yellow-400">
                                        <Clock className="w-3 h-3" />
                                        {getTimeRemaining()}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    Viewed {shareInfo?.accessCount} time{shareInfo?.accessCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certificate Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    {/* Status Badge */}
                    <div className="px-6 pt-6 pb-4 border-b border-neutral-800">
                        <div className="flex items-center justify-between">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                                certificate?.status === 'verified' 
                                    ? 'bg-green-900/30 text-green-400' 
                                    : certificate?.status === 'revoked'
                                    ? 'bg-red-900/30 text-red-400'
                                    : 'bg-yellow-900/30 text-yellow-400'
                            }`}>
                                {certificate?.status === 'verified' ? (
                                    <><ShieldCheck className="w-4 h-4" /> Verified</>
                                ) : certificate?.status === 'revoked' ? (
                                    <><AlertCircle className="w-4 h-4" /> Revoked</>
                                ) : (
                                    <><Clock className="w-4 h-4" /> Pending</>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={copyLink}
                                    className="hover:bg-neutral-800"
                                >
                                    {copySuccess ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </Button>
                                {certificate?.fileData && (
                                    <Button
                                        size="sm"
                                        onClick={downloadCertificate}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="p-6">
                        <h2 className="text-3xl font-bold text-white mb-6">{certificate?.title}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">
                                    Issued By
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                                    <Building2 className="w-5 h-5 text-blue-400" />
                                    <span className="font-medium">{certificate?.issuerName}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">
                                    Awarded To
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                                    <User className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <p className="font-medium">{certificate?.recipientName}</p>
                                        <p className="text-xs text-neutral-400">{certificate?.recipientEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">
                                    Issue Date
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                                    <Calendar className="w-5 h-5 text-green-400" />
                                    <span className="font-medium">
                                        {new Date(certificate?.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">
                                    Certificate Hash
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                                    <Hash className="w-5 h-5 text-yellow-400" />
                                    <code className="text-xs font-mono text-neutral-400 truncate">
                                        {certificate?.certificateHash?.substring(0, 20)}...
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        {certificate?.metadata && Object.keys(certificate.metadata).length > 0 && (
                            <div className="mt-6 p-4 bg-neutral-800 rounded-lg">
                                <h3 className="text-sm font-semibold text-neutral-300 mb-3">Additional Information</h3>
                                <dl className="space-y-2">
                                    {Object.entries(certificate.metadata).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <dt className="text-neutral-400 capitalize">{key.replace(/_/g, ' ')}:</dt>
                                            <dd className="text-white font-medium">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                    </div>

                    {/* Blockchain Verification */}
                    <div className="px-6 py-4 bg-neutral-800/50 border-t border-neutral-800">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <ShieldCheck className="w-4 h-4 text-green-400" />
                            <span>This certificate is secured and verified on the blockchain</span>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-8 text-center p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Want your own digital certificates?</h3>
                    <p className="text-neutral-400 text-sm mb-4">
                        Join InnerveX DigiBank to issue, manage, and share blockchain-verified certificates
                    </p>
                    <Button
                        onClick={() => navigate('/signup')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        Get Started Free
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SharedView;
