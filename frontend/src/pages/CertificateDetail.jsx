import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Share2, ShieldAlert, ArrowLeft, MoreVertical, Copy, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';

const CertificateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useStore(state => state.token);

  // Try store first (instant), fallback to DB fetch
  const storeMatch = useStore(state =>
    state.certificates.find(c => c.id === id) ||
    state.requests.find(r => r.id === id)
  );

  const [certificate, setCertificate] = useState(storeMatch || null);
  const [loading, setLoading] = useState(!storeMatch);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeMatch) {
      setCertificate(storeMatch);
      return;
    }
    // Fetch from DB if not in store
    const fetchCert = async () => {
      try {
        const res = await fetch(`${API_URL}/api/certificates/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const c = data.certificate;
          setCertificate({
            id: c._id,
            title: c.title,
            issuer: c.issuerName,
            recipient: c.recipientName,
            date: c.createdAt?.split('T')[0] || '',
            status: c.status,
            fileData: c.fileData || null,
            fileName: c.fileName || null,
            fileType: c.fileType || null,
          });
        } else {
          setError('Certificate not found');
        }
      } catch {
        setError('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  if (loading) return (
    <Layout className="bg-neutral-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </Layout>
  );

  if (error || !certificate) return (
    <Layout className="bg-neutral-950 p-6">
      <p className="text-red-400 text-center mt-10">{error || 'Certificate not found'}</p>
      <Button onClick={() => navigate(-1)} className="mt-4 w-full rounded-full">Go Back</Button>
    </Layout>
  );

  // Determine file render type
  const isPDF = certificate.fileType === 'application/pdf';
  const isImage = certificate.fileType?.startsWith('image/');

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

        {/* Certificate Card */}
        <div className="bg-surface rounded-3xl p-1 pb-8 overflow-hidden shadow-2xl border border-neutral-800 relative">
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
                <span className="text-neutral-500">Recipient</span>
                <span className="text-white font-medium">{certificate.recipient}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span className={`font-medium capitalize flex items-center gap-1 ${certificate.status === 'revoked' ? 'text-red-500' : 'text-green-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${certificate.status === 'revoked' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  {certificate.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Issued On</span>
                <span className="text-white font-medium">{certificate.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Certificate ID</span>
                <span className="text-white font-mono flex items-center gap-2 text-xs">
                  {String(id).toUpperCase().slice(0, 16)}...
                  <Copy
                    className="w-3 h-3 text-neutral-600 cursor-pointer"
                    onClick={() => navigator.clipboard.writeText(id)}
                  />
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

        {/* ── File Preview ─────────────────────────────── */}
        {certificate.fileData && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Attached File
              {certificate.fileName && (
                <span className="text-neutral-600 font-normal">— {certificate.fileName}</span>
              )}
            </h3>

            {isPDF && (
              <iframe
                src={certificate.fileData}
                title="Certificate PDF"
                className="w-full rounded-2xl border border-neutral-800"
                style={{ height: '480px' }}
              />
            )}

            {isImage && (
              <img
                src={certificate.fileData}
                alt="Certificate"
                className="w-full rounded-2xl border border-neutral-800 object-contain max-h-96"
              />
            )}

            {!isPDF && !isImage && (
              <a
                href={certificate.fileData}
                download={certificate.fileName || 'certificate'}
                className="flex items-center justify-center gap-2 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-blue-400 hover:bg-neutral-800 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Download {certificate.fileName || 'File'}
              </a>
            )}
          </div>
        )}

        {/* Actions */}
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
