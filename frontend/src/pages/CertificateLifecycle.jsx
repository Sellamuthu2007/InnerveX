import React from 'react';
import Layout from '../components/Layout';
import { GitCommit, Circle, CheckCircle2, XCircle } from 'lucide-react';

const LifecycleStep = ({ title, date, status, isLast }) => {
    let Icon = Circle;
    let color = "text-neutral-600";
    let lineColor = "bg-neutral-800";

    if (status === 'completed') {
        Icon = CheckCircle2;
        color = "text-green-500";
        lineColor = "bg-green-500";
    } else if (status === 'current') {
        Icon = GitCommit;
        color = "text-blue-500";
    } else if (status === 'revoked') {
        Icon = XCircle;
        color = "text-red-500";
    }

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <Icon className={`w-6 h-6 ${color} z-10 bg-black`} />
                {!isLast && <div className={`w-0.5 h-full ${lineColor} my-1`}></div>}
            </div>
            <div className="pb-8">
                <h3 className={`font-semibold ${status === 'current' ? 'text-white' : 'text-neutral-400'}`}>
                    {title}
                </h3>
                <p className="text-xs text-neutral-500">{date}</p>
            </div>
        </div>
    );
};

const CertificateLifecycle = () => {
    return (
        <Layout className="p-6">
            <h1 className="text-2xl font-bold mb-8 mt-4">Certificate Journey</h1>
            
            <div className="bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800">
                 <LifecycleStep 
                    title="Requested by User" 
                    date="20 Sep 2024, 10:30 AM" 
                    status="completed" 
                 />
                 <LifecycleStep 
                    title="Institution Verified" 
                    date="21 Sep 2024, 02:15 PM" 
                    status="completed" 
                 />
                 <LifecycleStep 
                    title="Issued on Blockchain" 
                    date="21 Sep 2024, 02:20 PM" 
                    status="completed" 
                 />
                 <LifecycleStep 
                    title="Accepted by User" 
                    date="21 Sep 2024, 02:25 PM" 
                    status="completed" 
                 />
                 <LifecycleStep 
                    title="Shared with Employer" 
                    date="25 Sep 2024, 09:00 AM" 
                    status="current" 
                 />
                 <LifecycleStep 
                    title="Verified Final" 
                    date="Pending" 
                    status="pending" 
                    isLast
                 />
            </div>
        </Layout>
    );
};

export default CertificateLifecycle;
