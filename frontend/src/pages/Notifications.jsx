import React from 'react';
import Layout from '../components/Layout';
import { Bell, CheckCircle, AlertTriangle, FileText, X } from 'lucide-react';
import { Button } from '../components/ui/button';

const Notifications = () => {
    const notifications = [
        { id: 1, type: 'success', title: 'Certificate Issued', message: 'IIT Madras issued "Bachelor of Technology"', time: '2 mins ago', read: false },
        { id: 2, type: 'alert', title: 'Security Alert', message: 'New login attempt from Chennai, IN', time: '1 hour ago', read: false },
        { id: 3, type: 'info', title: 'Request Update', message: 'University of Toronto viewed your profile', time: '5 hours ago', read: true },
        { id: 4, type: 'info', title: 'System', message: 'Wallet backup reminder: Download your keys', time: '1 day ago', read: true },
    ];

    return (
        <Layout className="p-6">
            <div className="flex justify-between items-center mb-6 mt-4">
                <h1 className="text-2xl font-bold">Inbox</h1>
                <Button variant="ghost" className="text-sm text-blue-500">Mark all read</Button>
            </div>

            <div className="space-y-4">
                {notifications.map((item) => (
                    <div 
                        key={item.id} 
                        className={`p-4 rounded-2xl border flex gap-4 ${item.read ? 'bg-neutral-900/50 border-neutral-800 opacity-60' : 'bg-neutral-900 border-neutral-700'}`}
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
                                <h3 className={`font-semibold text-sm ${item.read ? 'text-neutral-400' : 'text-white'}`}>{item.title}</h3>
                                <span className="text-xs text-neutral-500">{item.time}</span>
                            </div>
                            <p className="text-sm text-neutral-400 mt-1">{item.message}</p>
                        </div>
                        {!item.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                    </div>
                ))}
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-xs text-neutral-600">You're all caught up!</p>
            </div>
        </Layout>
    );
};

export default Notifications;
