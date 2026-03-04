import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Building2, Plus, Users, ShieldAlert, History, UserCheck, ShieldCheck, Send, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useStore } from '../lib/store';

const InstitutionMode = () => {
    const navigate = useNavigate();
    const { requests, certificates, name, fetchIssuedCertificates, fetchInstitutionRequests, logout } = useStore();
    
    // Fetch certificates and requests on load
    useEffect(() => {
        fetchIssuedCertificates();
        fetchInstitutionRequests();
    }, [fetchIssuedCertificates, fetchInstitutionRequests]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Filter data for this institution
    const myPendingRequests = requests.filter(r => r.institution === name && r.status === 'sent');
    const myIssuedCerts = certificates.filter(c => c.type === 'issued' || c.issuer === name);

    return (
        <Layout className="bg-neutral-950 p-6">
            <div className="flex justify-between items-center mb-8 mt-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800">
                        <Building2 className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{name || 'Institution'}</h1>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Issuer
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/profile')} size="icon" variant="ghost" className="rounded-full bg-neutral-900/50">
                        <UserIcon className="w-5 h-5" />
                    </Button>
                    <Button onClick={handleLogout} size="icon" variant="ghost" className="rounded-full bg-neutral-900/50 hover:bg-red-900/30">
                        <LogOut className="w-5 h-5 text-red-400" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-3xl">{myIssuedCerts.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-neutral-400">Total Issued</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-3xl">{myPendingRequests.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-neutral-400">Pending Actions</p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
                <LinkButton onClick={() => navigate('/issue-certificate')} icon={Plus} label="Upload" color="text-blue-400" bg="bg-blue-900/20" />
                <LinkButton onClick={() => navigate('/issue-certificate')} icon={Send} label="Send" color="text-purple-400" bg="bg-purple-900/20" />
                <LinkButton onClick={() => navigate('/verify-requests')} icon={UserCheck} label="Approvals" color="text-yellow-400" bg="bg-yellow-900/20" count={myPendingRequests.length} />
                <LinkButton onClick={() => navigate('/revoke')} icon={ShieldAlert} label="Revoke" color="text-red-400" bg="bg-red-900/20" />
            </div>

            <h2 className="font-semibold mb-4 flex justify-between items-center">
                <span>Pending Requests</span>
                {myPendingRequests.length > 0 && (
                    <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate('/verify-requests')}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        View All
                    </Button>
                )}
            </h2>
            <div className="space-y-3 mb-8">
                {myPendingRequests.length > 0 ? myPendingRequests.slice(0, 3).map((req) => (
                    <div 
                        key={req.id} 
                        className="bg-surface p-4 rounded-2xl border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors"
                        onClick={() => navigate(`/approve-request?id=${req.id}`)}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center text-sm font-bold text-orange-500">
                                {req.recipient.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{req.title}</p>
                                <p className="text-xs text-neutral-500">From: {req.recipient}</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/approve-request?id=${req.id}`);
                            }}
                        >
                            Review & Approve
                        </Button>
                    </div>
                )) : (
                    <div className="text-center py-8 text-neutral-500">
                        <p>No pending requests.</p>
                    </div>
                )}
            </div>

            <h2 className="font-semibold mb-4">Recent Issuances</h2>
            <div className="space-y-3">
                {myIssuedCerts.length > 0 ? myIssuedCerts.slice(0, 5).map((cert) => (
                    <div 
                        key={cert.id} 
                        className="bg-surface p-4 rounded-2xl flex justify-between items-center border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors"
                        onClick={() => navigate(`/certificate/${cert.id}`)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-sm font-bold text-neutral-500">
                                {cert.title.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium">{cert.title}</p>
                                <p className="text-xs text-neutral-500">To: {cert.recipient} • {cert.date}</p>
                            </div>
                        </div>
                        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-md">
                            {cert.status}
                        </span>
                    </div>
                )) : (
                    <div className="text-center py-8 text-neutral-500">
                        <p>No certificates issued yet.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

const LinkButton = ({ icon: Icon, label, color, bg, count, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group relative">
        <div className={`w-16 h-16 rounded-3xl ${bg} flex items-center justify-center transition-transform group-active:scale-95`}>
            <Icon className={`w-7 h-7 ${color}`} />
        </div>
        {count > 0 && (
            <div className="absolute top-0 right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                {count}
            </div>
        )}
        <span className="text-xs text-neutral-400 font-medium">{label}</span>
    </button>
);

export default InstitutionMode;
