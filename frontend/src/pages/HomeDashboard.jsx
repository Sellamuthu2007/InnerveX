import React from 'react';
import Layout from '../components/Layout';
import { useStore } from '../lib/store';
import { User, QrCode, Search, Bell, Send, Download, ScanLine } from 'lucide-react';
import CertificateBalance from '../components/CertificateBalance';
import ActivityTimeline from '../components/ActivityTimeline';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const HomeDashboard = () => {
  const navigate = useNavigate();
  const user = useStore(state => state);
  
  return (
    <Layout className="p-0">
      {/* Top Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-black p-6 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-700">
                <User className="text-white w-5 h-5" />
             </div>
             <div>
                <h1 className="font-semibold text-lg">{user.name || 'Student'}</h1>
                <p className="text-xs text-neutral-400 font-mono">{user.walletId || 'Loading ID...'}</p>
             </div>
          </div>
          <div className="flex gap-2">
             <Button size="icon" variant="ghost" className="rounded-full bg-neutral-900/50">
               <QrCode className="w-5 h-5" />
             </Button>
             <Button onClick={() => navigate('/notifications')} size="icon" variant="ghost" className="rounded-full bg-neutral-900/50">
               <Bell className="w-5 h-5" />
             </Button>
          </div>
        </div>

        {/* Certificate Looking Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search certificates & institutions" 
            className="w-full h-12 bg-neutral-900 rounded-full pl-12 pr-4 text-sm text-white placeholder:text-neutral-500 border border-neutral-800 focus:outline-none focus:border-primary"
          />
        </div>

        <CertificateBalance />
      </div>

      {/* Main Actions Grid - GPay Style */}
      <div className="px-6 py-2">
         <div className="grid grid-cols-4 gap-4 mb-8">
            <ActionItem 
               icon={Download} 
               label="Request" 
               color="text-blue-500" 
               onClick={() => navigate('/request-certificate')}
            />
            <ActionItem 
               icon={Send} 
               label="Send" 
               color="text-green-500" 
               onClick={() => navigate('/send-certificate')} 
            />
            <ActionItem 
               icon={ScanLine} 
               label="Scan" 
               color="text-purple-500" 
               onClick={() => {}} 
            />
            <ActionItem 
               icon={User} 
               label="Profile" 
               color="text-yellow-500" 
               onClick={() => {}} 
            />
         </div>

         <ActivityTimeline />
      </div>
      
    </Layout>
  );
};

const ActionItem = ({ icon: Icon, label, color, onClick }) => (
  <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
  >
    <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:bg-neutral-800 group-active:scale-95 transition-all">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <span className="text-xs text-neutral-400 font-medium">{label}</span>
  </button>
);

export default HomeDashboard;
