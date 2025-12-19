import React from 'react';
import Layout from '../components/Layout';
import { Shield, Bell, Lock, Eye, Languages, HelpCircle, LogOut } from 'lucide-react';

const Settings = () => {
    return (
        <Layout className="p-6">
            <h1 className="text-2xl font-bold mb-8 mt-4">Settings</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-sm text-neutral-500 font-semibold mb-3 uppercase tracking-wider">Account</h2>
                    <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
                        <SettingItem icon={Shield} label="Security & Privacy" />
                        <SettingItem icon={Bell} label="Notifications" />
                        <SettingItem icon={Lock} label="Wallet Keys (Backup)" />
                    </div>
                </section>

                <section>
                    <h2 className="text-sm text-neutral-500 font-semibold mb-3 uppercase tracking-wider">Appearance</h2>
                    <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
                        <SettingItem icon={Eye} label="Display Mode" value="Dark" />
                        <SettingItem icon={Languages} label="Language" value="English" />
                    </div>
                </section>

                <section>
                    <h2 className="text-sm text-neutral-500 font-semibold mb-3 uppercase tracking-wider">Support</h2>
                    <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
                        <SettingItem icon={HelpCircle} label="Help & Support" />
                        <button className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-neutral-800 transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </section>
                
                <p className="text-center text-xs text-neutral-600 pt-6">
                    InnerveX v1.0.0 (Alpha Prototype)
                </p>
            </div>
        </Layout>
    );
};

const SettingItem = ({ icon: Icon, label, value }) => (
    <button className="w-full p-4 flex items-center justify-between border-b border-neutral-800 last:border-0 hover:bg-neutral-800 transition-colors">
        <div className="flex items-center gap-4">
            <Icon className="w-5 h-5 text-neutral-400" />
            <span className="text-white font-medium">{label}</span>
        </div>
        {value && <span className="text-sm text-neutral-500">{value}</span>}
    </button>
);

export default Settings;
