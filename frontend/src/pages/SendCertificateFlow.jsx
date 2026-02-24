import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStore } from '../lib/store';
import { Search, CheckCircle2, User, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SendCertificateFlow = () => {
  const navigate = useNavigate();
  const { certificates, shareCertificate, name } = useStore();
  const [step, setStep] = useState(1);
  const [selectedCert, setSelectedCert] = useState(null);
  const [email, setEmail] = useState('');
  const [timeline, setTimeline] = useState('7 Days');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async () => {
    setIsProcessing(true);
    
    // Calculate expiration if needed (optional)
    let expiresAt = null;
    if (timeline === '24 Hours') expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    else if (timeline === '7 Days') expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    else if (timeline === '30 Days') expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const success = await shareCertificate({
        certificateId: selectedCert.id,
        recipientEmail: email,
        expiresAt
    });

    setIsProcessing(false);

    if (success) {
      navigate('/dashboard'); 
    }
  };

  return (
    <Layout className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
            {step === 1 && "Choose Certificate"}
            {step === 2 && "Choose Recipient"}
            {step === 3 && "Confirm Transfer"}
        </h1>
        <div className="h-1 bg-neutral-800 rounded-full mt-4 overflow-hidden">
            <motion.div 
               className="h-full bg-primary" 
               initial={{ width: 0 }}
               animate={{ width: `${(step / 3) * 100}%` }}
            />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {certificates.map(cert => (
              <div 
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                className={`p-4 rounded-2xl border cursor-pointer transition-colors ${selectedCert?.id === cert.id ? 'bg-blue-900/20 border-blue-500' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'}`}
              >
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-white">{cert.title}</h3>
                        <p className="text-sm text-neutral-400">{cert.issuer}</p>
                    </div>
                    {selectedCert?.id === cert.id && <CheckCircle2 className="text-blue-500" />}
                 </div>
              </div>
            ))}
            <Button 
                className="w-full mt-6" 
                disabled={!selectedCert}
                onClick={() => setStep(2)}
            >
                Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
             <div className="space-y-4">
                 <div>
                    <label className="text-sm text-neutral-400 ml-1 mb-2 block">HR / Employer Email</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input 
                        placeholder="e.g. hr@amazon.com" 
                        className="pl-12 h-14 bg-neutral-900 border-neutral-800"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-sm text-neutral-400 ml-1 mb-2 block">Access Timeline</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['24 Hours', '7 Days', '30 Days'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setTimeline(t)}
                                className={`py-3 rounded-xl border text-sm transition-all ${timeline === t ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                 </div>
             </div>
             
             <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 h-12" disabled={!email} onClick={() => setStep(3)}>Continue</Button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-6 pt-8"
          >
             {isProcessing ? (
                 <div className="flex flex-col items-center animate-pulse">
                    <Fingerprint className="w-20 h-20 text-blue-500 mb-4" />
                    <h2 className="text-xl font-bold">Verifying Biometrics...</h2>
                 </div>
             ) : (
                 <>
                    <h2 className="text-2xl font-bold">Confirm Transfer</h2>
                    <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 text-left space-y-4">
                        <div>
                            <p className="text-xs text-neutral-500">Sending</p>
                            <p className="font-semibold">{selectedCert?.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500">To</p>
                            <p className="font-semibold">{email}</p>
                            <p className="text-xs text-blue-400 mt-1">Valid for: {timeline}</p>
                        </div>
                    </div>
                    
                    <Button className="w-full text-lg h-14 rounded-full" onClick={handleSend}>
                        Authenticate & Send
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>Cancel</Button>
                 </>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default SendCertificateFlow;
