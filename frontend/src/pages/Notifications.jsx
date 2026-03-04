import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Bell, CheckCircle, AlertTriangle, FileText, X, Share2, Eye, User, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';

const Notifications = () => {
    const navigate = useNavigate();
    const { token, addToast } = useStore();
    const [sharedCertificates, setSharedCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSharedCertificates();
    }, []);

    const fetchSharedCertificates = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/shares/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.shares) {
                setSharedCertificates(data.shares);
            }
        } catch (error) {
            console.error('Error fetching shared certificates:', error);
            addToast('Failed to load shared certificates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const systemNotifications = [
        { id: 1, type: 'success', title: 'Certificate Issued', message: 'Your certificate request has been approved', time: '2 mins ago', read: false },
        { id: 2, type: 'alert', title: 'Security Alert', message: 'New login attempt detected', time: '1 hour ago', read: false },
        { id: 3, type: 'info', title: 'System', message: 'Wallet backup reminder: Download your keys', time: '1 day ago', read: true },
    ];

    return (
        <Layout className="p-6">
            <div className="flex justify-between items-center mb-6 mt-4">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <Button variant="ghost" className="text-sm text-blue-500">Mark all read</Button>
            </div>

            {/* Shared Certificates Section */}
            {sharedCertificates.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-400" />
                        Certificates Shared With You
                    </h2>
                    <div className="space-y-3">
                        {sharedCertificates.map((share) => (
                            <div 
                                key={share.shareId} 
                                className="bg-blue-900/20 border border-blue-800 rounded-xl p-5 hover:border-blue-700 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center shrink-0">
                                        <Share2 className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-white text-lg mb-1">{share.title}</h3>
                                                <p className="text-sm text-neutral-400">{share.issuer}</p>
                                            </div>
                                            <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full">
                                                Shared
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs text-neutral-400 mb-3">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                <span>From: {share.sharedBy}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(share.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {share.expiresAt && (
                                            <p className="text-xs text-orange-400 mb-3">
                                                Expires: {new Date(share.expiresAt).toLocaleDateString()}
                                            </p>
                                        )}

                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 rounded-full"
                                            onClick={() => navigate(`/certificate/${share.id}`)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Certificate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* System Notifications */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-neutral-400" />
                    System Notifications
                </h2>
                <div className="space-y-4">
                    {systemNotifications.map((item) => (
                        <div 
                            key={item.id} 
                            className={`p-4 rounded-2xl border flex gap-4 ${
                                item.read 
                                    ? 'bg-neutral-900/50 border-neutral-800 opacity-60' 
                                    : 'bg-neutral-900 border-neutral-700'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                item.type === 'success' ? 'bg-green-900/20 text-green-500' :
                                item.type === 'alert' ? 'bg-red-900/20 text-red-500' :
                                'bg-blue-900/20 text-blue-500'
                            }`}>
                                {item.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                                 item.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                                 <FileText className="w-5 h-5" />}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-semibold text-sm ${
                                        item.read ? 'text-neutral-400' : 'text-white'
                                    }`}>
                                        {item.title}
                                    </h3>
                                    <span className="text-xs text-neutral-500">{item.time}</span>
                                </div>
                                <p className="text-sm text-neutral-400 mt-1">{item.message}</p>
                            </div>
                            {!item.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                        </div>
                    ))}
                </div>
            </div>
            
            {loading && (
                <div className="text-center py-8 text-neutral-400">
                    <p>Loading notifications...</p>
                </div>
            )}

            {!loading && sharedCertificates.length === 0 && systemNotifications.length === 0 && (
                <div className="mt-8 text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
                    <p className="text-neutral-400">No notifications yet</p>
                    <p className="text-xs text-neutral-600 mt-2">You're all caught up!</p>
                </div>
            )}
        </Layout>
    );
};

export default Notifications;
