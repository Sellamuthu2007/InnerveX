import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStore } from '../lib/store';
import { Search, CheckCircle2, User, Fingerprint, Mail, Clock, Hash, Copy, Shield, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SendCertificateFlow = () => {
  const navigate = useNavigate();
  const { certificates, shareCertificate, name, addToast, fetchMyCertificates } = useStore();
  const [step, setStep] = useState(1);
  const [selectedCert, setSelectedCert] = useState(null);
  const [email, setEmail] = useState('');
  const [timeline, setTimeline] = useState('7 Days');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      setLoading(true);
      await fetchMyCertificates();
      setLoading(false);
    };
    loadCertificates();
  }, [fetchMyCertificates]);

  // Filter certificates that can be shared (only verified certificates that user received)
  const shareableCertificates = certificates.filter(cert => {
    console.log(`Checking certificate: ${cert.title}`, {
      status: cert.status,
      type: cert.type,
      isVerified: cert.status === 'verified',
      isReceived: cert.type === 'received' || !cert.type,
      willInclude: cert.status === 'verified' && (cert.type === 'received' || !cert.type)
    });
    
    // Only share verified certificates
    if (cert.status !== 'verified') return false;
    
    // Only share certificates received by this user (not issued by them)
    return cert.type === 'received' || !cert.type;
  });

  // Debug logging
  useEffect(() => {
    console.log('=== SEND CERTIFICATE DEBUG ===');
    console.log('📋 All certificates from store:', certificates);
    console.log('📊 Total certificate count:', certificates.length);
    
    certificates.forEach((cert, index) => {
      console.log(`Certificate ${index + 1}:`, {
        id: cert.id,
        title: cert.title,
        status: cert.status,
        type: cert.type,
        issuer: cert.issuer,
        recipient: cert.recipient
      });
    });
    
    console.log('✅ Shareable certificates:', shareableCertificates);
    console.log('📊 Shareable count:', shareableCertificates.length);
    console.log('🔄 Loading state:', loading);
    console.log('==============================');
  }, [certificates, shareableCertificates, loading]);

  const handleSend = async () => {
    setIsProcessing(true);
    
    // Calculate expiration
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
      // Generate share link with certificate hash
      const link = `${window.location.origin}/verify-public?cert=${selectedCert.id}`;
      setShareLink(link);
      setShareSuccess(true);
      setStep(4);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/dashboard');
    } else if (step === 4) {
      navigate('/dashboard');
    } else {
      setStep(step - 1);
    }
  };

  return (
    <Layout className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {step === 1 && "Choose Certificate"}
            {step === 2 && "Choose Recipient"}
            {step === 3 && "Confirm Transfer"}
            {step === 4 && "Share Successful"}
          </h1>
        </div>
        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
               className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
               initial={{ width: 0 }}
               animate={{ width: step === 4 ? '100%' : `${(step / 3) * 100}%` }}
               transition={{ duration: 0.3 }}
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
            {loading ? (
              <div className="text-center py-12 text-neutral-400">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading your certificates...</p>
              </div>
            ) : shareableCertificates.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <Shield className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
                <p className="text-lg font-medium mb-2">No Certificates Available</p>
                <p className="text-sm mb-6">You need to have verified certificates to share them</p>
                <Button onClick={() => navigate('/dashboard')} className="rounded-full">
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-neutral-400 mb-4">
                  Select a certificate to share with others via email ({shareableCertificates.length} available)
                </p>
                {shareableCertificates.map(cert => (
                  <div 
                    key={cert.id}
                    onClick={() => setSelectedCert(cert)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedCert?.id === cert.id 
                        ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-900/20' 
                        : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-1">{cert.title}</h3>
                        <p className="text-sm text-neutral-400">{cert.issuer}</p>
                      </div>
                      {selectedCert?.id === cert.id && (
                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-green-900/30 text-green-400">
                        {cert.status}
                      </span>
                      <span className="text-neutral-500">• Issued: {cert.date}</span>
                    </div>
                  </div>
                ))}
                <Button 
                  className="w-full h-14 rounded-full text-lg mt-6" 
                  disabled={!selectedCert}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </>
            )}
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
            {/* Selected Certificate Preview */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
              <p className="text-xs text-blue-400 mb-2">Sharing Certificate</p>
              <h3 className="font-semibold text-white">{selectedCert?.title}</h3>
              <p className="text-sm text-neutral-400">{selectedCert?.issuer}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 ml-1 mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Recipient Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                  <Input 
                    type="email"
                    placeholder="e.g. hr@company.com or friend@email.com" 
                    className="pl-12 h-14 bg-neutral-900 border-neutral-800"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2 ml-1">
                  Recipient will receive an email notification with secure access link
                </p>
              </div>

              <div>
                <label className="text-sm text-neutral-400 ml-1 mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Access Duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['24 Hours', '7 Days', '30 Days'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTimeline(t)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                        timeline === t 
                          ? 'bg-blue-900/20 border-blue-500 text-blue-400' 
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-2 ml-1">
                  Access will expire after the selected duration
                </p>
              </div>
            </div>
             
            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 h-12 rounded-full" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                className="flex-1 h-12 rounded-full" 
                disabled={!email || !email.includes('@')} 
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pt-4"
          >
            {isProcessing ? (
              <div className="flex flex-col items-center py-12 animate-pulse">
                <Fingerprint className="w-20 h-20 text-blue-500 mb-4 animate-pulse" />
                <h2 className="text-xl font-bold mb-2">Processing Share...</h2>
                <p className="text-sm text-neutral-400">Generating secure access link</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Confirm Transfer</h2>
                  <p className="text-sm text-neutral-400">Review the details before sharing</p>
                </div>

                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                  {/* Certificate Info */}
                  <div className="p-5 border-b border-neutral-800">
                    <p className="text-xs text-neutral-500 mb-2">Certificate</p>
                    <h3 className="font-semibold text-lg mb-1">{selectedCert?.title}</h3>
                    <p className="text-sm text-neutral-400">{selectedCert?.issuer}</p>
                  </div>

                  {/* Recipient Info */}
                  <div className="p-5 border-b border-neutral-800">
                    <p className="text-xs text-neutral-500 mb-2">Recipient</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <p className="font-semibold">{email}</p>
                    </div>
                  </div>

                  {/* Access Info */}
                  <div className="p-5 border-b border-neutral-800">
                    <p className="text-xs text-neutral-500 mb-2">Access Duration</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <p className="font-semibold">{timeline}</p>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="p-5 bg-green-900/10">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-400 mb-1">Secure Sharing</p>
                        <p className="text-xs text-neutral-400">
                          Certificate will be shared with cryptographic hash verification. 
                          Recipient will receive email notification with secure access link.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-full" 
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                    onClick={handleSend}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Send Securely
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {step === 4 && shareSuccess && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6 pt-4"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Certificate Shared!</h2>
              <p className="text-neutral-400">
                {email} will receive an email notification with secure access
              </p>
            </div>

            {/* Share Details */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-2">Shared Certificate</p>
                <p className="font-semibold">{selectedCert?.title}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-2">Recipient</p>
                <p className="font-semibold">{email}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-2">Valid Until</p>
                <p className="font-semibold">
                  {timeline === '24 Hours' && new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                  {timeline === '7 Days' && new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  {timeline === '30 Days' && new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Share Link */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-semibold text-blue-400">Verification Link</p>
              </div>
              <div className="bg-neutral-950 rounded-lg p-3 mb-3">
                <p className="text-xs font-mono text-neutral-400 break-all">{shareLink}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-full border-blue-800 text-blue-400 hover:bg-blue-900/20"
                onClick={() => copyToClipboard(shareLink)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full h-14 rounded-full" 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button 
                variant="outline"
                className="w-full h-12 rounded-full" 
                onClick={() => {
                  setStep(1);
                  setSelectedCert(null);
                  setEmail('');
                  setTimeline('7 Days');
                  setShareSuccess(false);
                }}
              >
                Share Another Certificate
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default SendCertificateFlow;
