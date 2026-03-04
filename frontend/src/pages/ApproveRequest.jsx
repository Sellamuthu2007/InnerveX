import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CheckCircle2, User, Mail, FileText, Upload, X, Calendar, Award } from 'lucide-react';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';

const ApproveRequest = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestId = searchParams.get('id');
    
    const { addToast, token, name: institutionName } = useStore();
    const [loading, setLoading] = useState(false);
    const [request, setRequest] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        issuerName: institutionName || '',
        recipientName: '',
        recipientEmail: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        grade: '',
        courseCode: '',
        additionalInfo: ''
    });
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    useEffect(() => {
        if (requestId) {
            fetchRequestDetails();
        }
    }, [requestId]);

    const fetchRequestDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/requests/institution`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            const req = data.requests.find(r => r._id === requestId);
            if (req) {
                setRequest(req);
                setFormData(prev => ({
                    ...prev,
                    title: req.title,
                    recipientName: req.recipientName,
                    recipientEmail: req.recipientEmail
                }));
            }
        } catch (error) {
            console.error('Error fetching request:', error);
            addToast('Failed to load request details', 'error');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(selectedFile.type)) {
                addToast('Only PDF and image files are allowed', 'error');
                return;
            }

            // Validate file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                addToast('File size must be less than 5MB', 'error');
                return;
            }

            setFile(selectedFile);

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleApprove = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if request is already approved
            if (request.status === 'approved') {
                // Skip approval, just issue certificate
                console.log('Request already approved, proceeding to issue certificate');
            } else {
                // Approve the request first
                const approveResponse = await fetch(`${API_URL}/api/v1/requests/${requestId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'approved' })
                });

                if (!approveResponse.ok) {
                    const errorData = await approveResponse.json();
                    throw new Error(errorData.message || 'Failed to approve request');
                }
            }

            // Convert file to base64 if exists
            let fileData = null;
            let fileName = null;
            let fileType = null;

            if (file) {
                const reader = new FileReader();
                fileData = await new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                fileName = file.name;
                fileType = file.type;
            }

            // Issue the certificate
            const certResponse = await fetch(`${API_URL}/api/v1/certificates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    issuerName: formData.issuerName,
                    recipientName: formData.recipientName,
                    recipientEmail: formData.recipientEmail,
                    fileData,
                    fileName,
                    fileType,
                    metadata: {
                        issueDate: formData.issueDate,
                        expiryDate: formData.expiryDate || null,
                        grade: formData.grade || null,
                        courseCode: formData.courseCode || null,
                        additionalInfo: formData.additionalInfo || null
                    }
                })
            });

            if (!certResponse.ok) {
                throw new Error('Failed to issue certificate');
            }

            addToast('Certificate issued successfully!', 'success');
            navigate('/institution-dashboard');
        } catch (error) {
            console.error('Error:', error);
            addToast(error.message || 'Failed to issue certificate', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!request) {
        return (
            <Layout className="p-6 flex items-center justify-center">
                <p className="text-neutral-400">Loading request details...</p>
            </Layout>
        );
    }

    return (
        <Layout className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Issue Certificate</h1>
                <p className="text-neutral-400 text-sm">Complete the details to issue the certificate</p>
            </div>

            {/* Requester Information */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Requester Information
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Name:</span>
                        <span className="text-white font-medium">{request.recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Email:</span>
                        <span className="text-white font-medium">{request.recipientEmail}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Requested:</span>
                        <span className="text-white font-medium">{request.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Date:</span>
                        <span className="text-white font-medium">
                            {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleApprove} className="space-y-6">
                {/* Certificate Title */}
                <div className="space-y-2">
                    <label className="text-sm text-neutral-400 ml-1">Certificate Title</label>
                    <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input 
                            placeholder="e.g., Bachelor of Technology in Computer Science" 
                            className="pl-12"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                </div>

                {/* Issue Date & Expiry Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400 ml-1">Issue Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                            <Input 
                                type="date"
                                className="pl-12"
                                value={formData.issueDate}
                                onChange={e => setFormData({...formData, issueDate: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400 ml-1">Expiry Date (Optional)</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                            <Input 
                                type="date"
                                className="pl-12"
                                value={formData.expiryDate}
                                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Grade & Course Code */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400 ml-1">Grade/CGPA (Optional)</label>
                        <Input 
                            placeholder="e.g., 8.5 CGPA or A+" 
                            value={formData.grade}
                            onChange={e => setFormData({...formData, grade: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400 ml-1">Course Code (Optional)</label>
                        <Input 
                            placeholder="e.g., CS-2024-001" 
                            value={formData.courseCode}
                            onChange={e => setFormData({...formData, courseCode: e.target.value})}
                        />
                    </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-2">
                    <label className="text-sm text-neutral-400 ml-1">Additional Information (Optional)</label>
                    <textarea 
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Any additional details about the certificate..."
                        value={formData.additionalInfo}
                        onChange={e => setFormData({...formData, additionalInfo: e.target.value})}
                    />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <label className="text-sm text-neutral-400 ml-1">Upload Certificate (Optional)</label>
                    <div className="border-2 border-dashed border-neutral-800 rounded-xl p-6 text-center">
                        {file ? (
                            <div className="space-y-3">
                                {filePreview && (
                                    <img src={filePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                                )}
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm text-white">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setFilePreview(null);
                                        }}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                                <p className="text-sm text-neutral-400 mb-1">Click to upload PDF or image</p>
                                <p className="text-xs text-neutral-600">Max size: 5MB</p>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button 
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 rounded-full"
                        onClick={() => navigate('/institution-dashboard')}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1 h-12 rounded-full bg-green-600 hover:bg-green-700"
                        disabled={loading}
                    >
                        {loading ? 'Issuing...' : 'Issue Certificate'}
                        <CheckCircle2 className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </form>
        </Layout>
    );
};

export default ApproveRequest;
