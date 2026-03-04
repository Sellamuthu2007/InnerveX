import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Building2, Search, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';
import { motion } from 'framer-motion';

const RequestCertificateFlow = () => {
    const navigate = useNavigate();
    const addRequest = useStore(state => state.addRequest);
    const addToast = useStore(state => state.addToast);
    const [institution, setInstitution] = useState('');
    const [certType, setCertType] = useState('');
    const [status, setStatus] = useState('input'); // input, sending, success
    const [colleges, setColleges] = useState([]);
    const [filteredColleges, setFilteredColleges] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const dropdownRef = useRef(null);

    // Fetch colleges on component mount
    useEffect(() => {
        fetchColleges();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch colleges from API
    const fetchColleges = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching colleges from:', `${API_URL}/api/v1/colleges?limit=500`);
            
            const response = await fetch(`${API_URL}/api/v1/colleges?limit=500`);
            console.log('📡 Response status:', response.status);
            
            const data = await response.json();
            console.log('📦 Response data:', data);
            
            if (data.success && data.colleges.length > 0) {
                console.log(`✅ Loaded ${data.colleges.length} colleges`);
                setColleges(data.colleges);
                setFilteredColleges(data.colleges.slice(0, 50));
            } else {
                console.warn('⚠️ No colleges returned from API:', data);
                addToast('Failed to load colleges. Please restart backend server.', 'error');
            }
        } catch (error) {
            console.error('❌ Error fetching colleges:', error);
            addToast('Failed to load colleges. Check if backend is running.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Search colleges
    const handleSearch = async (query) => {
        setInstitution(query);
        setSelectedCollege(null);
        
        // Show initial colleges if query is empty or too short
        if (!query || query.trim().length < 2) {
            setFilteredColleges(colleges.slice(0, 50));
            setShowDropdown(colleges.length > 0); // Only show if we have colleges
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/v1/colleges/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success && data.colleges.length > 0) {
                setFilteredColleges(data.colleges);
                setShowDropdown(true);
            } else {
                // Fallback to local filtering
                const filtered = colleges.filter(college =>
                    college.name.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 50);
                setFilteredColleges(filtered);
                setShowDropdown(filtered.length > 0);
            }
        } catch (error) {
            console.error('Error searching colleges:', error);
            // Fallback to local filtering
            const filtered = colleges.filter(college =>
                college.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 50);
            setFilteredColleges(filtered);
            setShowDropdown(filtered.length > 0);
        }
    };

    // Select college from dropdown
    const selectCollege = (college) => {
        setInstitution(college.name);
        setSelectedCollege(college);
        setShowDropdown(false);
    };

    const handleRequest = async (e) => {
        e.preventDefault();
        
        // Validate college selection
        if (!selectedCollege) {
            addToast('Please select a valid institution from the list', 'error');
            return;
        }
        
        setStatus('sending');
        
        try {
            // Wait for the real API call to finish
            await addRequest({
                title: certType,
                institutionName: selectedCollege.name
            });
            
            setStatus('success');
        } catch (error) {
            setStatus('input');
            addToast('Failed to send request', 'error');
        }
    };

    if (status === 'success') {
        return (
            <Layout className="flex items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Request Sent!</h2>
                    <p className="text-neutral-400 mb-8">
                        Wait for {institution} to verify and issue your certificate.
                    </p>
                    <Button onClick={() => navigate('/dashboard')} className="w-full rounded-full h-12">
                        Back to Home
                    </Button>
                </motion.div>
            </Layout>
        );
    }

    return (
        <Layout className="p-6">
            <h1 className="text-2xl font-bold mb-6 mt-4">Request Certificate</h1>
            
            <form onSubmit={handleRequest} className="space-y-6">
                <div className="space-y-4">
                    <label className="text-sm text-neutral-400 ml-1">Search Institution</label>
                    <div className="relative" ref={dropdownRef}>
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5 z-10" />
                        <Input 
                            placeholder="Search for Indian colleges/universities..." 
                            className="pl-12 pr-10"
                            value={institution}
                            onChange={e => handleSearch(e.target.value)}
                            onFocus={() => {
                                if (filteredColleges.length > 0) {
                                    setShowDropdown(true);
                                } else if (colleges.length > 0) {
                                    setFilteredColleges(colleges.slice(0, 50));
                                    setShowDropdown(true);
                                }
                            }}
                            required
                            autoComplete="off"
                        />
                        {loading ? (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5 animate-spin" />
                        ) : (
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        )}
                        
                        {/* Dropdown */}
                        {showDropdown && filteredColleges.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                                {filteredColleges.map((college, index) => (
                                    <div
                                        key={index}
                                        onClick={() => selectCollege(college)}
                                        className="p-3 hover:bg-neutral-800 cursor-pointer border-b border-neutral-800 last:border-b-0"
                                    >
                                        <div className="font-medium text-white text-sm">{college.name}</div>
                                        <div className="text-xs text-neutral-500 mt-1">
                                            {college.city && college.state ? `${college.city}, ${college.state}` : college.state || college.city || 'India'}
                                            {college.nirf_rank && ` • NIRF Rank: ${college.nirf_rank}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Selected college indicator */}
                        {selectedCollege && (
                            <div className="mt-2 p-3 bg-green-900/20 border border-green-800 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <div className="flex-1">
                                    <div className="text-sm text-green-400 font-medium">{selectedCollege.name}</div>
                                    <div className="text-xs text-green-600">
                                        {selectedCollege.city && selectedCollege.state ? `${selectedCollege.city}, ${selectedCollege.state}` : 'Verified Institution'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm text-neutral-400 ml-1">Certificate Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Degree', 'Diploma', 'Course', 'Skill Badge'].map((type) => (
                            <div 
                                key={type}
                                onClick={() => setCertType(type)}
                                className={`p-4 rounded-xl border cursor-pointer text-center text-sm font-medium transition-colors ${certType === type ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'}`}
                            >
                                {type}
                            </div>
                        ))}
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-14 rounded-full mt-8 text-lg"
                    disabled={!selectedCollege || !certType || status === 'sending'}
                >
                    {status === 'sending' ? 'Sending Request...' : 'Send Request'}
                </Button>
            </form>
        </Layout>
    );
};

export default RequestCertificateFlow;
