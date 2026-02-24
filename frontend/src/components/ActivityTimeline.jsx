import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { useStore } from '../lib/store';

const ActivityTimeline = () => {
  const navigate = useNavigate();
  // Combine certificates and requests for a unified feed
  const { certificates, requests, name } = useStore();

  // DB already scopes certificates and requests to the logged-in user 
  const activities = [
    ...certificates.map(c => ({ ...c, type: c.type || 'received', date: c.date })),
    ...requests.map(r => ({ ...r, type: 'sent', date: r.date }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold ml-1">Recent Activity</h3>
      <div className="space-y-2">
        {activities.map((item, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
            onClick={() => item.type === 'received' ? navigate(`/certificate/${item.id}`) : null}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${item.type === 'received' ? 'bg-green-900/30 text-green-500' : 'bg-blue-900/30 text-blue-500'}`}>
                {item.type === 'received' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-xs text-neutral-400">{item.issuer || item.institution}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium capitalize ${item.status === 'revoked' ? 'text-red-500' : 'text-white'}`}>{item.status}</p>
              <p className="text-xs text-neutral-500">{item.date}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-center text-neutral-500 py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
