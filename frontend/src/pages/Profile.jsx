import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Wallet, 
  Shield, 
  LogOut, 
  Edit2,
  Copy,
  Check,
  Building2,
  Calendar
} from 'lucide-react';
import { useStore } from '../lib/store';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, name, walletId, userRole } = useStore();
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyWalletId = () => {
    navigator.clipboard.writeText(walletId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userEmail = user?.email || 'user@example.com';
  const userName = name || user?.name || 'User';
  const role = userRole || user?.role || 'individual';
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
  const lastLogin = user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A';

  return (
    <Layout className="bg-neutral-950">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="text-white" />
          </Button>
          <h2 className="text-lg font-semibold">Profile</h2>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Edit2 className="text-white w-5 h-5" />
          </Button>
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 border-4 border-neutral-900">
            {role === 'institution' ? (
              <Building2 className="w-12 h-12 text-white" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{userName}</h1>
          <p className="text-sm text-neutral-400 capitalize flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {role}
          </p>
        </div>

        {/* Profile Information Cards */}
        <div className="space-y-3 mb-6">
          {/* Email */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-500">Email Address</p>
                <p className="text-sm text-white font-medium">{userEmail}</p>
              </div>
            </div>
          </Card>

          {/* Wallet ID */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500">Wallet ID</p>
                <p className="text-sm text-white font-mono truncate">{walletId}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyWalletId}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-neutral-400" />
                )}
              </Button>
            </div>
          </Card>

          {/* Join Date */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-500">Member Since</p>
                <p className="text-sm text-white font-medium">{joinDate}</p>
              </div>
            </div>
          </Card>

          {/* Last Login */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-500">Last Login</p>
                <p className="text-sm text-white font-medium">{lastLogin}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-neutral-900 border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {useStore.getState().certificates.length}
            </p>
            <p className="text-xs text-neutral-500">Certificates</p>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {useStore.getState().requests.length}
            </p>
            <p className="text-xs text-neutral-500">Requests</p>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {useStore.getState().shared.length}
            </p>
            <p className="text-xs text-neutral-500">Shared</p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 rounded-full border-neutral-800 hover:bg-neutral-900"
            onClick={() => navigate('/settings')}
          >
            <Edit2 className="w-5 h-5 mr-2" />
            Edit Profile
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 rounded-full border-red-900/30 text-red-400 hover:bg-red-900/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600">
            InnerveX DigiBank v1.0.0
          </p>
          <p className="text-xs text-neutral-700 mt-1">
            Secured by Blockchain Technology
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
