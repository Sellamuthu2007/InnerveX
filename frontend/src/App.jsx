import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ToastContainer from './components/ui/Toast';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import IndividualRegistration from './pages/IndividualRegistration';
import HomeDashboard from './pages/HomeDashboard';
import CertificateDetail from './pages/CertificateDetail';
import SendCertificateFlow from './pages/SendCertificateFlow';
import RequestCertificateFlow from './pages/RequestCertificateFlow';
import InstitutionMode from './pages/InstitutionMode';
import CertificateLifecycle from './pages/CertificateLifecycle';
import InstitutionTrustRegistry from './pages/InstitutionTrustRegistry';
import CertificateRevocation from './pages/CertificateRevocation';
import IssueCertificate from './pages/IssueCertificate';

// Placeholder or future imports
import DualConsent from './pages/DualConsent';
import UserReputation from './pages/UserReputation';
import EmployerDashboard from './pages/EmployerDashboard';
import PublicVerification from './pages/PublicVerification';
import FraudManagement from './pages/FraudManagement';
import RegulatoryView from './pages/RegulatoryView';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import WalletView from './pages/WalletView';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/role-select" element={<RoleSelection />} />
        <Route path="/register" element={<IndividualRegistration />} />
        <Route path="/dashboard" element={<HomeDashboard />} />
        <Route path="/certificate/:id" element={<CertificateDetail />} />
        
        <Route path="/request-certificate" element={<RequestCertificateFlow />} />
        <Route path="/send-certificate" element={<SendCertificateFlow />} />
        
        {/* Institution Routes */}
        <Route path="/institution-dashboard" element={<InstitutionMode />} />
        <Route path="/lifecycle/:id" element={<CertificateLifecycle />} />
        <Route path="/trust-registry" element={<InstitutionTrustRegistry />} />
        <Route path="/revoke" element={<CertificateRevocation />} />

        <Route path="/issue-certificate" element={<IssueCertificate />} />
        {/* Verification & Advanced Routes */}
        <Route path="/dual-consent" element={<DualConsent />} />
        <Route path="/reputation" element={<UserReputation />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/verify-public" element={<PublicVerification />} />
        <Route path="/fraud-management" element={<FraudManagement />} />
        <Route path="/regulatory" element={<RegulatoryView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/wallet" element={<WalletView />} />
      </Routes>
    </Router>
  );
}

export default App;
