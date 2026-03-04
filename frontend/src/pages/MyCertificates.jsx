import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Award, Download, Eye, Calendar, Building2, Shield, ShieldAlert, ShieldCheck, Filter, Grid3x3, List } from 'lucide-react';
import { useStore } from '../lib/store';

const MyCertificates = () => {
    const navigate = useNavigate();
    const { certificates, fetchMyCertificates } = useStore();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, verified, pending, revoked
    const [viewMode, setViewMode] = useState('grid'); // grid, list

    useEffect(() => {
        const loadCerts = async () => {
            setLoading(true);
            await fetchMyCertificates();
            setLoading(false);
        };
        loadCerts();
    }, [fetchMyCertificates]);

    const filteredCerts = certificates.filter(cert => {
        if (filter === 'verified') return cert.status === 'verified';
        if (filter === 'pending') return cert.status === 'pending';
        if (filter === 'revoked') return cert.status === 'revoked';
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified': return 'text-green-400 bg-green-900/30';
            case 'pending': return 'text-yellow-400 bg-yellow-900/30';
            case 'revoked': return 'text-red-400 bg-red-900/30';
            default: return 'text-neutral-400 bg-neutral-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified': return ShieldCheck;
            case 'pending': return Shield;
            case 'revoked': return ShieldAlert;
            default: return Shield;
        }
    };

    const CertificateCard = ({ cert }) => {
        const StatusIcon = getStatusIcon(cert.status);
        
        return (
            <div
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-all cursor-pointer group"
                onClick={() => navigate(`/certificate/${cert.id}`)}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(cert.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cert.status}
                    </div>
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                    {cert.title}
                </h3>

                <div className="space-y-2 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{cert.issuer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(cert.date).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800 flex gap-2">
                    <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/certificate/${cert.id}`);
                        }}
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-neutral-700 hover:bg-neutral-800"
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement download
                        }}
                    >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                    </Button>
                </div>
            </div>
        );
    };

    const CertificateListItem = ({ cert }) => {
        const StatusIcon = getStatusIcon(cert.status);
        
        return (
            <div
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-all cursor-pointer flex items-center justify-between"
                onClick={() => navigate(`/certificate/${cert.id}`)}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1">{cert.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {cert.issuer}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(cert.date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(cert.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cert.status}
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/certificate/${cert.id}`);
                        }}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Layout className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Award className="w-7 h-7 text-blue-400" />
                    My Certificates
                </h1>
                <p className="text-neutral-400 text-sm">
                    View and manage all your certificates in one place
                </p>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <Button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm ${
                            filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                    >
                        All ({certificates.length})
                    </Button>
                    <Button
                        onClick={() => setFilter('verified')}
                        className={`px-4 py-2 rounded-lg text-sm ${
                            filter === 'verified'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                    >
                        Verified ({certificates.filter(c => c.status === 'verified').length})
                    </Button>
                    <Button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm ${
                            filter === 'pending'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                    >
                        Pending ({certificates.filter(c => c.status === 'pending').length})
                    </Button>
                    <Button
                        onClick={() => setFilter('revoked')}
                        className={`px-4 py-2 rounded-lg text-sm ${
                            filter === 'revoked'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                    >
                        Revoked ({certificates.filter(c => c.status === 'revoked').length})
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'bg-neutral-800' : ''}
                    >
                        <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewMode('list')}
                        className={viewMode === 'list' ? 'bg-neutral-800' : ''}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Certificates Display */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredCerts.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCerts.map(cert => (
                            <CertificateCard key={cert.id} cert={cert} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredCerts.map(cert => (
                            <CertificateListItem key={cert.id} cert={cert} />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-12">
                    <Award className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                    <p className="text-neutral-400 mb-6">
                        Request certificates from institutions to get started
                    </p>
                    <Button
                        onClick={() => navigate('/request-certificate')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Request Certificate
                    </Button>
                </div>
            )}
        </Layout>
    );
};

export default MyCertificates;
