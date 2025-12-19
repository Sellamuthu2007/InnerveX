import React from 'react';
import Layout from '../components/Layout';
import { Search, ShieldCheck, Building2, ExternalLink } from 'lucide-react';
import { Input } from '../components/ui/input';

const InstitutionTrustRegistry = () => {
    const institutions = [
        { name: 'IIT Madras', rank: '#1 Tech', trust: 99, status: 'Verified' },
        { name: 'Anna University', rank: '#5 State', trust: 95, status: 'Verified' },
        { name: 'Coursera (Global)', rank: 'EdTech', trust: 92, status: 'Verified' },
        { name: 'Google Certs', rank: 'Corporate', trust: 98, status: 'Verified' },
    ];

    return (
        <Layout className="p-6">
            <h1 className="text-2xl font-bold mb-2 mt-4">Trust Registry</h1>
            <p className="text-neutral-400 mb-6">Verified issuers on the network</p>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                <Input placeholder="Search Registry" className="pl-12" />
            </div>

            <div className="space-y-4">
                {institutions.map((inst, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral-950 rounded-full flex items-center justify-center border border-neutral-800">
                                <Building2 className="text-neutral-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white">{inst.name}</h3>
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-xs text-neutral-500">Trust Score: {inst.trust}/100 • {inst.rank}</p>
                            </div>
                        </div>
                        <ExternalLink className="text-neutral-600 w-5 h-5" />
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default InstitutionTrustRegistry;
