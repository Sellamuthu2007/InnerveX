import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { Briefcase, UserCheck, Search, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';
import { useStore } from '../lib/store';

const EmployerDashboard = () => {
    const { shared, name, fetchSharedCertificates } = useStore();

    useEffect(() => {
        fetchSharedCertificates();
    }, [fetchSharedCertificates]);

    return (
        <Layout className="p-6">
            <div className="flex justify-between items-center mb-8 mt-6">
                <div>
                    <h1 className="font-bold text-xl">{name || 'Employer'}</h1>
                    <p className="text-xs text-neutral-400">Verified Recruiter</p>
                </div>
                <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl mb-8 flex justify-between items-center">
                <div>
                    <p className="text-3xl font-bold text-white">24</p>
                    <p className="text-xs text-neutral-400">Verified Candidates</p>
                </div>
                <div className="h-10 w-[1px] bg-neutral-800"></div>
                <div>
                    <p className="text-3xl font-bold text-white">8</p>
                    <p className="text-xs text-neutral-400">Pending Review</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                    <Input placeholder="Search applicants..." className="pl-10 h-10 bg-neutral-900 border-neutral-800" />
                </div>
                <button 
                    onClick={() => useStore.getState().addToast('Filters applied successfully', 'info')}
                    className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800 hover:bg-neutral-800 transition-colors"
                >
                    <Filter className="w-4 h-4 text-neutral-400" />
                </button>
            </div>

            <h2 className="font-semibold mb-4">Recent Verifications</h2>
            <div className="space-y-3">
            <div className="space-y-3">
                {shared.length > 0 ? shared.map((item) => (
                    <div key={item.shareId} className="bg-surface p-4 rounded-2xl flex justify-between items-center border border-neutral-800 hover:bg-neutral-800 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-900/30">
                                {item.recipient?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-white">{item.recipient}</p>
                                <p className="text-xs text-neutral-500">{item.title} • {item.sharedBy}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-green-500 flex items-center gap-1 justify-end"><UserCheck className="w-3 h-3" /> {item.status}</p>
                             <div className="flex items-center gap-2 mt-1 justify-end">
                                <p className="text-[10px] text-neutral-600">Rx: {item.date}</p>
                                {item.fileUrl && (
                                    <a 
                                        href={item.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded-full no-underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        View File
                                    </a>
                                )}
                             </div>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-8 text-neutral-500">
                        <p>No valid shared certificates found.</p>
                    </div>
                )}
            </div>
            </div>
        </Layout>
    );
};

export default EmployerDashboard;
