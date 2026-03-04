import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { FileText, Building2, Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';

const MyRequests = () => {
    const navigate = useNavigate();
    const { token, addToast } = useStore();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, sent, approved, rejected

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/requests/my`, {
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

    const filteredRequests = filter === 'all' 
        ? requests 
        : requests.filter(r => r.status === filter);

    const getStatusConfig = (status) => {
        const configs = {
            sent: {
                icon: Clock,
                color: 'text-yellow-400',
                bg: 'bg-yellow-900/30',
                border: 'border-yellow-800',
                label: 'Pending',
                description: 'Waiting for institution approval'
            },
            approved: {
                icon: CheckCircle2,
                color: 'text-green-400',
                bg: 'bg-green-900/30',
                border: 'border-green-800',
                label: 'Approved',
                description: 'Certificate has been issued'
            },
            rejected: {
                icon: XCircle,
                color: 'text-red-400',
                bg: 'bg-red-900/30',
                border: 'border-red-800',
                label: 'Rejected',
                description: 'Request was declined'
            }
        };
        return configs[status] || configs.sent;
    };

    const getStatusBadge = (status) => {
        const config = getStatusConfig(status);
        const Icon = config.icon;
        
        return (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${config.bg} ${config.color} ${config.border}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </div>
        );
    };

    return (
        <Layout className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">My Certificate Requests</h1>
                <p className="text-neutral-400 text-sm">Track your certificate requests and their status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-yellow-400" />
                        <div>
                            <p className="text-2xl font-bold text-yellow-400">
                                {requests.filter(r => r.status === 'sent').length}
                            </p>
                            <p className="text-xs text-yellow-600">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-2xl font-bold text-green-400">
                                {requests.filter(r => r.status === 'approved').length}
                            </p>
                            <p className="text-xs text-green-600">Approved</p>
                        </div>
                    </div>
                </div>
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-2xl font-bold text-red-400">
                                {requests.filter(r => r.status === 'rejected').length}
                            </p>
                            <p className="text-xs text-red-600">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {[
                    { value: 'all', label: 'All Requests', count: requests.length },
                    { value: 'sent', label: 'Pending', count: requests.filter(r => r.status === 'sent').length },
                    { value: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
                    { value: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length }
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
                    <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
                    <p className="text-lg font-medium mb-2">No {filter !== 'all' ? filter : ''} requests</p>
                    <p className="text-sm mb-6">Start by requesting a certificate from an institution</p>
                    <Button onClick={() => navigate('/request-certificate')} className="rounded-full">
                        Request Certificate
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => {
                        const config = getStatusConfig(request.status);
                        const StatusIcon = config.icon;
                        
                        return (
                            <div 
                                key={request._id} 
                                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{request.title}</h3>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <p className="text-sm text-neutral-500">
                                            Requested on {new Date(request.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Institution Details */}
                                <div className="bg-neutral-950 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-neutral-400">Institution</p>
                                            <p className="font-medium text-lg">{request.institutionName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Information */}
                                <div className={`rounded-lg p-4 border ${config.bg} ${config.border}`}>
                                    <div className="flex items-start gap-3">
                                        <StatusIcon className={`w-5 h-5 ${config.color} mt-0.5`} />
                                        <div className="flex-1">
                                            <p className={`font-semibold ${config.color} mb-1`}>{config.label}</p>
                                            <p className="text-sm text-neutral-400">{config.description}</p>
                                            
                                            {/* Processed Date */}
                                            {request.processedAt && (
                                                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {request.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                                                    {new Date(request.processedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            )}

                                            {/* Rejection Reason */}
                                            {request.status === 'rejected' && request.rejectionReason && (
                                                <div className="mt-3 p-3 bg-red-950/50 rounded-lg border border-red-900">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                                        <div>
                                                            <p className="text-xs font-semibold text-red-400 mb-1">Rejection Reason:</p>
                                                            <p className="text-sm text-red-300">{request.rejectionReason}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* View Certificate Button */}
                                            {request.status === 'approved' && (
                                                <Button
                                                    size="sm"
                                                    className="mt-3 bg-green-600 hover:bg-green-700 rounded-full"
                                                    onClick={() => navigate('/dashboard')}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Certificate
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="mt-4 pt-4 border-t border-neutral-800">
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span>Submitted</span>
                                        </div>
                                        <div className="flex-1 h-px bg-neutral-800"></div>
                                        {request.status !== 'sent' && (
                                            <>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                    <span>{request.status === 'approved' ? 'Approved' : 'Rejected'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Action Button */}
            {!loading && (
                <div className="mt-6">
                    <Button 
                        onClick={() => navigate('/request-certificate')} 
                        className="w-full h-12 rounded-full"
                    >
                        Request New Certificate
                    </Button>
                </div>
            )}
        </Layout>
    );
};

export default MyRequests;
