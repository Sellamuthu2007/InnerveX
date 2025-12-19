import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { ShieldCheck, User, Building2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const RoleCard = ({ icon: Icon, title, description, onClick, color }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full bg-neutral-900 border border-neutral-800 p-5 rounded-3xl flex items-center gap-4 text-left transition-colors hover:border-neutral-700 hover:bg-neutral-800 group"
  >
    <div className={`p-4 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('bg-opacity-20', '')}`} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
      <p className="text-xs text-neutral-400 mt-1">{description}</p>
    </div>
  </motion.button>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Layout className="justify-between p-6">
      <div className="flex-1 flex flex-col pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 mb-10"
        >
          <div className="mx-auto bg-neutral-800 p-4 rounded-3xl w-20 h-20 flex items-center justify-center border border-neutral-700 shadow-2xl">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              InnerveX
            </h1>
            <p className="text-neutral-400 text-sm max-w-xs mx-auto leading-relaxed">
              Decentralized Certificate Banking.<br />Select your role to continue.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <RoleCard 
            icon={User} 
            title="Individual" 
            description="Store & Share Certificates"
            color="text-blue-500 bg-blue-900"
            onClick={() => navigate('/signup?role=individual')}
          />
          <RoleCard 
            icon={Building2} 
            title="Institution" 
            description="Issue & Manage Verified Assets"
            color="text-purple-500 bg-purple-900"
            onClick={() => navigate('/signup?role=institution')}
          />
          <RoleCard 
            icon={Eye} 
            title="Hiring Company" 
            description="Verify Candidates Instantly"
            color="text-yellow-500 bg-yellow-900"
            onClick={() => navigate('/signup?role=employer')}
          />
        </motion.div>
      </div>

      <div className="space-y-4 mb-6 mt-8">
        <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-600 text-xs">ALREADY HAVE AN ACCOUNT?</span>
            <div className="flex-grow border-t border-neutral-800"></div>
        </div>
        <Button 
          variant="outline" 
          className="w-full text-lg h-14 rounded-full border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
      </div>
    </Layout>
  );
};

export default LandingPage;
