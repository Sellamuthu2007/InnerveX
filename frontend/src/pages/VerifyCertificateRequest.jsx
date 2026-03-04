import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Search, User, Mail, Calendar, FileText, CheckCircle2, XCircle, Clock, Shield } from 'lucide-react';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';

const VerifyCertificateRequest = () => {
    const navigate = useNavigate();
    const { token, addToast } = useStore();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('sent'); // sent, approved, rejected, all

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/requests/institution`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.requests) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            addToast('Failed to load requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (requestId) => {
        navigate(`/approve-request?id=${requestId}`);
    };

    const handleReject = async (requestId) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            const response = await fetch(`${API_URL}/api/v1/requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'rejected', reason })
            });

            if (response.ok) {
                addToast('Request rejected', 'success');
                fetchRequests();
            } else {
                throw new Error('Failed to reject request');
            }
        } catch (error) {
            console.error('Error:', error);
            addToast('Failed to reject request', 'error');
        }
    };

    const filteredRequests = filter === 'all' 
        ? requests 
        : requests.filter(r => r.status === filter);

    const getStatusBadge = (status) => {
        const styles = {
            sent: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
            approved: 'bg-green-900/30 text-green-400 border-green-800',
            rejected: 'bg-red-900/30 text-red-400 border-red-800'
        };
        
        const icons = {
            sent: Clock,
            approved: CheckCircle2,
            rejected: XCircle
        };

        const Icon = icons[status];
        
        return (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${styles[status]}`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    };

    return (
        <Layout className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Certificate Requests</h1>
                <p className="text-neutral-400 text-sm">Review and verify certificate requests from individuals</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {[
                    { value: 'sent', label: 'Pending', count: requests.filter(r => r.status === 'sent').length },
                    { value: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
                    { value: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
                    { value: 'all', label: 'All', count: requests.length }
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                            filter === tab.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="text-center py-12 text-neutral-400">
                    <p>Loading requests...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
                    <p className="text-lg font-medium mb-2">No {filter !== 'all' ? filter : ''} requests</p>
                    <p className="text-sm">Requests will appear here when individuals request certificates</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <div 
                            key={request._id} 
                            className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1">{request.title}</h3>
                                    <p className="text-sm text-neutral-500">
                                        Requested on {new Date(request.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {getStatusBadge(request.status)}
                            </div>

                            {/* Requester Details */}
                            <div className="bg-neutral-950 rounded-lg p-4 mb-4 space-y-3">
                                <h4 className="text-sm font-semibold text-neutral-400 mb-3">Requester Information</h4>
                                
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-400">Full Name</p>
                                        <p className="font-medium">{request.recipientName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-400">Email Address</p>
                                        <p className="font-medium">{request.recipientEmail}</p>
                                    </div>
                                </div>

                                {request.recipientId && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-neutral-400">Wallet ID</p>
                                            <p className="font-medium font-mono text-xs">
                                                {request.recipientId.walletId || 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-400">Request Date</p>
                                        <p className="font-medium">
                                            {new Date(request.createdAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {request.status === 'sent' && (
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-11 rounded-full border-red-800 text-red-400 hover:bg-red-900/20"
                                        onClick={() => handleReject(request._id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        className="flex-1 h-11 rounded-full bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(request._id)}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Approve & Issue
                                    </Button>
                                </div>
                            )}

                            {request.status === 'rejected' && request.rejectionReason && (
                                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                                    <p className="text-sm text-red-400">
                                        <span className="font-semibold">Rejection Reason:</span> {request.rejectionReason}
                                    </p>
                                </div>
                            )}

                            {request.status === 'approved' && (
                                <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                                    <p className="text-sm text-green-400">
                                        ✓ Certificate has been issued to this requester
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default VerifyCertificateRequest;
