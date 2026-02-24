/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShieldCheck, User, Building2, Eye, ChevronDown, Moon, Sun, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RoleCard = ({ icon: Icon, title, description, onClick, color }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl flex items-center gap-6 text-left transition-all hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-lg dark:hover:shadow-blue-900/10 group relative overflow-hidden"
  >
    <div className={`p-4 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center shrink-0`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('bg-opacity-20', '').split(' ')[0]}`} />
    </div>
    
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white leading-tight">{title}</h3>
      </div>
      <p className="text-sm font-sans text-gray-500 dark:text-neutral-400 mt-1.5 leading-relaxed">{description}</p>
    </div>

    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-200 dark:via-neutral-800 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
  </motion.button>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-black transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors shadow-lg border border-gray-200 dark:border-neutral-800"
        >
          <AnimatePresence mode="wait">
             {theme === 'dark' ? (
                <motion.div
                  key="moon"
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={20} />
                </motion.div>
             ) : (
                <motion.div
                  key="sun"
                  initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={20} />
                </motion.div>
             )}
          </AnimatePresence>
        </button>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl mx-auto z-10 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4 border border-blue-100 dark:border-blue-800">
             <ShieldCheck size={16} />
             <span>The Beta version</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            India’s Digital Bank for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Trustworthy Certificates</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Eliminating fake certificates. Empowering citizens. Redefining trust for a digital India.
          </p>
            
          <p className="text-sm md:text-base text-gray-500 dark:text-neutral-500 max-w-lg mx-auto">
             DigiBank is a decentralized certificate banking system where institutions issue verified credentials, citizens own them securely, and authenticity is guaranteed by blockchain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg"
              className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
              onClick={() => scrollToSection('role-selection')}
            >
              Join the Trust Revolution
            </Button>
            <Button 
               variant="outline"
               size="lg"
               className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all"
               onClick={() => scrollToSection('how-it-works')}
            >
              How DigiBank Works
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={() => scrollToSection('how-it-works')}
        >
            <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* Existing Content Section - Role Selection */}
      <section id="role-selection" className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-black">
        
        {/* Left Panel: Info & Branding */}
        <div className="lg:w-[45%] bg-gray-50 dark:bg-neutral-950 relative overflow-hidden flex flex-col justify-center p-8 lg:p-20 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-neutral-900">
           <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
           </div>

           <div className="relative z-10 space-y-8 max-w-lg">
              <div className="w-16 h-16 bg-white dark:bg-neutral-900 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-neutral-800 shadow-sm">
                 <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
                  Choose Your Role in <span className="text-blue-600 dark:text-blue-500">India’s Trust Network</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-neutral-400 font-sans leading-relaxed">
                  DigiBank securely connects citizens, institutions, and employers on a single trusted certificate infrastructure.
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm font-semibold text-gray-900 dark:text-white font-heading">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 border-2 border-white dark:border-black"></div>
                    ))}
                 </div>
                 <span>Joined by 10,000+ Institutions</span>
              </div>

              <div className="pt-2">
                 <Button 
                    variant="outline"
                    className="rounded-full border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    onClick={() => scrollToSection('how-it-works')}
                 >
                    See How It Works <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
           </div>
        </div>

        {/* Right Panel: Role Cards */}
        <div className="lg:w-[55%] bg-white dark:bg-black p-6 lg:p-24 flex flex-col justify-center">
            <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-md mx-auto w-full"
            >
            <RoleCard 
                icon={User} 
                title="Individual" 
                description="Store credentials securely in your digital wallet."
                color="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900"
                onClick={() => navigate('/login?role=individual')}
            />
            <RoleCard 
                icon={Building2} 
                title="Institution" 
                description="Issue verifiable certificates to students."
                color="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900"
                onClick={() => navigate('/login?role=institution')}
            />
            <RoleCard 
                icon={Eye} 
                title="Hiring Company" 
                description="Verify candidate credentials instantly."
                color="text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900"
                onClick={() => navigate('/login?role=employer')}
            />

            <div className="pt-8 flex items-center justify-end gap-2 text-sm">
                <span className="text-gray-500 dark:text-neutral-500">Already have an account?</span>
                <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 font-semibold hover:no-underline hover:text-blue-700 dark:hover:text-blue-300"
                    onClick={() => navigate('/login')}
                >
                    Log In <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
            </motion.div>
        </div>

      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-black/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white">A Seamless Trust Ecosystem</h2>
            <p className="text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
              From issuance to verification, every step is secured by immutable blockchain technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Lines for Desktop */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-900 to-transparent -z-10"></div>

            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-neutral-900 shadow-xl border border-gray-100 dark:border-neutral-800 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Building2 className="w-10 h-10 text-purple-600 dark:text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">1. Institution Issues</h3>
                <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">Universities and authorities mint tamper-proof credentials directly to the blockchain.</p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-neutral-900 shadow-xl border border-gray-100 dark:border-neutral-800 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <User className="w-10 h-10 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">2. You Own It</h3>
                <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">Certificates are stored in your private digital wallet, owned and controlled by you forever.</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-neutral-900 shadow-xl border border-gray-100 dark:border-neutral-800 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">3. Instant Verification</h3>
                <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">Employers or agencies instantly verify authenticity with one click. No more fake degrees.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
