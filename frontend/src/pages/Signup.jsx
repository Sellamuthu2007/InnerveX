import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStore } from '../lib/store';
import { API_URL } from '../lib/config';
import { UserPlus, User, Mail, Lock, ArrowRight, Building2, Briefcase, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'individual';
    
    const { setUser, setToken, addToast } = useStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    
    // College dropdown states (only for institutions)
    const [colleges, setColleges] = useState([]);
    const [filteredColleges, setFilteredColleges] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loadingColleges, setLoadingColleges] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const dropdownRef = useRef(null);

    // Dynamic Content based on Role
    const getRoleContent = () => {
        switch(role) {
            case 'institution': return { label: 'Organization Name', icon: Building2, redirect: '/institution-dashboard' };
            case 'employer': return { label: 'Company Name', icon: Briefcase, redirect: '/employer-dashboard' };
            default: return { label: 'Full Name', icon: User, redirect: '/dashboard' };
        }
    };
    const roleContent = getRoleContent();

    // Fetch colleges on mount (only for institutions)
    useEffect(() => {
        if (role === 'institution') {
            fetchColleges();
        }
    }, [role]);

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
            setLoadingColleges(true);
            const response = await fetch(`${API_URL}/api/v1/colleges?limit=500`);
            const data = await response.json();
            
            if (data.success) {
                setColleges(data.colleges);
                setFilteredColleges(data.colleges.slice(0, 50));
            }
        } catch (error) {
            console.error('Error fetching colleges:', error);
        } finally {
            setLoadingColleges(false);
        }
    };

    // Search colleges
    const handleCollegeSearch = async (query) => {
        setFormData({...formData, name: query});
        setSelectedCollege(null);
        
        if (query.trim().length < 2) {
            setFilteredColleges(colleges.slice(0, 50));
            setShowDropdown(true);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/v1/colleges/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success) {
                setFilteredColleges(data.colleges);
                setShowDropdown(true);
            }
        } catch (error) {
            // Fallback to local filtering
            const filtered = colleges.filter(college =>
                college.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 50);
            setFilteredColleges(filtered);
            setShowDropdown(true);
        }
    };

    // Select college from dropdown
    const selectCollege = (college) => {
        setFormData({...formData, name: college.name});
        setSelectedCollege(college);
        setShowDropdown(false);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Validate college selection for institutions
        if (role === 'institution' && !selectedCollege) {
            addToast('Please select your institution from the list', 'error');
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role })
            });
            const data = await res.json();
            
            if (res.ok) {
                setUser(data.user);
                setToken(data.token);  // persist JWT → survives page refresh
                addToast('Account created successfully', 'success');
                navigate(roleContent.redirect);
            } else {
                // Show validation errors or suggestions
                if (data.suggestions && data.suggestions.length > 0) {
                    addToast(data.message, 'error');
                    setFilteredColleges(data.suggestions);
                    setShowDropdown(true);
                } else if (data.errors && data.errors.length > 0) {
                    data.errors.forEach(err => addToast(err.message, 'error'));
                } else {
                    addToast(data.message || 'Signup failed', 'error');
                }
            }
        } catch (error) {
            addToast('Server connection failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="bg-black p-6 justify-center">
            <div className="mb-12 text-center">
                <div className="w-16 h-16 bg-blue-900/20 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-blue-500/30">
                    <UserPlus className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-neutral-400">Join the decentralized network</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                 <div className="space-y-2">
                    {role === 'institution' ? (
                        <div className="relative" ref={dropdownRef}>
                            <roleContent.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5 z-10" />
                            <Input 
                                placeholder="Search for your institution..." 
                                className="pl-12 pr-10 h-14 bg-neutral-900 border-neutral-800"
                                value={formData.name}
                                onChange={e => handleCollegeSearch(e.target.value)}
                                onFocus={() => setShowDropdown(true)}
                                required
                                autoComplete="off"
                            />
                            {loadingColleges ? (
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
                    ) : (
                        <div className="relative">
                            <roleContent.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                            <Input 
                                placeholder={roleContent.label} 
                                className="pl-12 h-14 bg-neutral-900 border-neutral-800"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                   <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input 
                            placeholder="Email Address" 
                            className="pl-12 h-14 bg-neutral-900 border-neutral-800"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input 
                            type="password"
                            placeholder="Password" 
                            className="pl-12 h-14 bg-neutral-900 border-neutral-800"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            required
                        />
                   </div>
                   <p className="text-xs text-neutral-500 ml-1">
                       Must be 8+ characters with uppercase, lowercase, and number
                   </p>
                </div>
                
                <Button 
                    type="submit" 
                    className="w-full h-14 rounded-full text-lg mt-4"
                    disabled={loading}
                >
                    {loading ? 'Creating Wallet...' : 'Get Started'} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </form>

            <p className="text-center text-neutral-500 mt-8">
                Already have an account? <Link to="/login" className="text-blue-500 font-semibold hover:underline">Log In</Link>
            </p>
        </Layout>
    );
};

export default Signup;
