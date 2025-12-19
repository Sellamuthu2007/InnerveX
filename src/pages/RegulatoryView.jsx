import React from 'react';
import Layout from '../components/Layout';
import { Building, Activity, Globe, Scale } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const RegulatoryView = () => {
    return (
        <Layout className="black p-6">
            <div className="flex justify-between items-center mb-8 mt-6">
                <div>
                    <h1 className="font-bold text-xl">AICTE / MoE</h1>
                    <p className="text-xs text-neutral-400">Governance Node</p>
                </div>
                <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                    <Scale className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="mb-6 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl border border-neutral-800">
                <p className="text-sm text-neutral-400 mb-2">Network Health</p>
                <div className="flex items-end gap-2">
                    <h2 className="text-4xl font-bold text-white">99.9%</h2>
                    <span className="text-green-500 text-sm mb-1">Operational</span>
                </div>
            </div>

            <h2 className="font-semibold mb-4">National Statistics</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-4">
                        <Building className="w-6 h-6 text-blue-500 mb-2" />
                        <p className="text-xl font-bold">1,240</p>
                        <p className="text-xs text-neutral-500">Institutions</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-4">
                        <Globe className="w-6 h-6 text-purple-500 mb-2" />
                        <p className="text-xl font-bold">2.5M</p>
                        <p className="text-xs text-neutral-500">Certificates</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex items-center gap-4">
                <Activity className="text-green-500 w-8 h-8" />
                <div>
                    <p className="font-bold">Real-time Auditing</p>
                    <p className="text-xs text-neutral-500">Monitoring 245 nodes for policy compliance.</p>
                </div>
            </div>
        </Layout>
    );
};

export default RegulatoryView;
