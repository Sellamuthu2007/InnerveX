import React from 'react';
import Layout from '../components/Layout';
import { Award, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const UserReputation = () => {
    return (
        <Layout className="p-6">
            <h1 className="text-2xl font-bold mb-6 mt-4">Trust Score</h1>

            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-3xl p-8 text-center mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full"></div>
                <p className="text-neutral-400 mb-2">Your Credibility Score</p>
                <h2 className="text-6xl font-bold text-white mb-2">850</h2>
                <span className="inline-block px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-semibold">Excellent</span>
            </div>

            <h2 className="font-semibold mb-4">Score Factors</h2>
            <div className="grid grid-cols-2 gap-4">
                <FactorCard icon={Award} label="Verified Certs" value="12" color="text-yellow-500" />
                <FactorCard icon={ShieldCheck} label="Issuer Trust" value="High" color="text-green-500" />
                <FactorCard icon={TrendingUp} label="Activity Age" value="2.5y" color="text-blue-500" />
                <FactorCard icon={AlertCircle} label="Red Flags" value="0" color="text-red-500" />
            </div>
            
            <div className="mt-8 p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <p className="text-sm text-neutral-400 leading-relaxed">
                    Your score is in the top <span className="text-white font-bold">5%</span> of users. 
                    Employers prioritize candidates with scores above 750.
                </p>
            </div>
        </Layout>
    );
};

const FactorCard = ({ icon: Icon, label, value, color }) => (
    <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <Icon className={`w-8 h-8 ${color}`} />
            <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-neutral-500">{label}</p>
            </div>
        </CardContent>
    </Card>
);

export default UserReputation;
