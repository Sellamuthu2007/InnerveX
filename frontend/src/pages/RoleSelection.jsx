import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { User, Building2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';

const RoleCard = ({ icon: Icon, title, description, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex items-center gap-4 text-left transition-colors hover:border-neutral-700 hover:bg-neutral-800 group"
  >
    <div className="bg-neutral-950 p-4 rounded-full group-hover:bg-black transition-colors">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-neutral-400">{description}</p>
    </div>
  </motion.button>
);

const RoleSelection = () => {
  const navigate = useNavigate();
  const setRole = useStore(state => state.setRole);

  const handleRoleSelect = (role, path) => {
    setRole(role);
    navigate(path);
  };

  return (
    <Layout className="p-6">
      <div className="mt-12 mb-8">
        <h1 className="text-3xl font-bold mb-2">Who are you?</h1>
        <p className="text-neutral-400">Select your role to continue</p>
      </div>

      <div className="space-y-4">
        <RoleCard 
          icon={User} 
          title="Individual" 
          description="Student, Citizen, or Holder"
          onClick={() => handleRoleSelect('individual', '/register')}
        />
        <RoleCard 
          icon={Building2} 
          title="Institution" 
          description="University, Company, or Issuer"
          onClick={() => handleRoleSelect('institution', '/institution-dashboard')}
        />
        <RoleCard 
          icon={Eye} 
          title="Verifier" 
          description="Employer or Public Verifier"
          onClick={() => handleRoleSelect('employer', '/employer-dashboard')}
        />
      </div>
    </Layout>
  );
};

export default RoleSelection;
