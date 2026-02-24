import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import { useStore } from '../lib/store';

const CertificateBalance = () => {
  const { certificates, requests, name } = useStore();

  // API already scopes certs to logged-in user — no extra name filter needed
  const myCerts = certificates;
  const myRequests = requests.filter(r => r.recipient === name);

  const verifiedCount = myCerts.filter(c => c.status === 'verified').length;
  const pendingCount = myRequests.filter(r => r.status === 'sent').length;

  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-1 bg-neutral-900 rounded-3xl p-4 border border-neutral-800 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className="absolute right-[-10px] top-[-10px] bg-blue-900/20 w-24 h-24 rounded-full blur-xl group-hover:bg-blue-900/30 transition-colors"></div>
        <div className="z-10">
          <ShieldCheck className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-neutral-400 text-xs">Verified Certificates</p>
        </div>
        <p className="text-4xl font-bold z-10">{verifiedCount}</p>
      </div>

      <div className="flex-1 bg-neutral-900 rounded-3xl p-4 border border-neutral-800 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className="absolute right-[-10px] top-[-10px] bg-yellow-900/20 w-24 h-24 rounded-full blur-xl group-hover:bg-yellow-900/30 transition-colors"></div>
        <div className="z-10">
          <Clock className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-neutral-400 text-xs">Pending Requests</p>
        </div>
        <p className="text-4xl font-bold z-10">{pendingCount}</p>
      </div>
    </div>
  );
};

export default CertificateBalance;
