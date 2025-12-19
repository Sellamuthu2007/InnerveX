import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Share2, ShieldAlert, ArrowLeft, MoreVertical, Copy, ShieldCheck } from 'lucide-react';
import { useStore } from '../lib/store';

const CertificateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const certificate = useStore(state => 
    state.certificates.find(c => c.id === id) || 
    state.requests.find(r => r.id === id)
  );

  if (!certificate) return <div className="text-white p-6">Certificate not found</div>;

  return (
    <Layout className="bg-neutral-950">
       <div className="p-6">
          <div className="flex justify-between items-center mb-8">
             <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="text-white" />
             </Button>
             <h2 className="text-lg font-semibold">Certificate Details</h2>
             <Button variant="ghost" size="icon">
                <MoreVertical className="text-white" />
             </Button>
          </div>

          <div className="bg-surface rounded-3xl p-1 pb-8 overflow-hidden shadow-2xl border border-neutral-800 relative">
             {/* Receipt Sawtooth Pattern */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
             
             <div className="p-8 pt-10 text-center space-y-4">
                <div className="w-20 h-20 bg-neutral-900 rounded-full mx-auto flex items-center justify-center border-2 border-neutral-800 mb-4">
                   <ShieldCheck className="w-10 h-10 text-primary" />
                </div>
                
                <div>
                   <h1 className="text-2xl font-bold text-white mb-2">{certificate.title}</h1>
                   <p className="text-neutral-400 font-medium">{certificate.issuer || certificate.institution}</p>
                </div>

                <div className="py-6 border-y border-neutral-800 space-y-4">
                   <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Status</span>
                      <span className="text-green-500 font-medium capitalize flex items-center gap-1">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div>
                         {certificate.status}
                      </span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Issued On</span>
                      <span className="text-white font-medium">{certificate.date}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Certificate ID</span>
                      <span className="text-white font-mono flex items-center gap-2">
                         {id.toUpperCase()}
                         <Copy className="w-3 h-3 text-neutral-600" />
                      </span>
                   </div>
                </div>

                <div className="pt-2">
                   <p className="text-xs text-neutral-600 font-mono break-all text-center">
                      BLOCKCHAIN PROOF: 0x71C...92F (Polygon)
                   </p>
                </div>
             </div>
          </div>

          <div className="mt-8 space-y-3">
             <Button className="w-full h-14 text-lg rounded-full gap-2">
                <Share2 className="w-5 h-5" />
                Share Certificate
             </Button>
             
             <Button variant="outline" className="w-full h-14 text-lg rounded-full gap-2 text-red-400 border-red-900/30 hover:bg-red-900/10">
                <ShieldAlert className="w-5 h-5" />
                Revoke Access
             </Button>
          </div>
       </div>
    </Layout>
  );
};

export default CertificateDetail;
