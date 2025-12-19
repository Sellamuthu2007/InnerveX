import { create } from 'zustand';

export const useStore = create((set) => ({
  userRole: null, // 'individual', 'institution', 'employer', 'regulatory'
  userId: null,
  name: '',
  walletId: '',
  
  setUser: (user) => set((state) => ({ ...state, ...user })),
  setRole: (role) => set({ userRole: role }),
  
  // Mock Data
  certificates: [
    { id: 'cert_1', title: 'Bachelor of Technology', issuer: 'IIT Madras', recipient: 'Rahul Sellamuthu', date: '2024-05-20', status: 'verified', type: 'degree' },
    { id: 'cert_2', title: 'React Developer Certification', issuer: 'Meta', recipient: 'Rahul Sellamuthu', date: '2024-06-15', status: 'verified', type: 'skill' },
    { id: 'cert_3', title: 'Hackathon Winner', issuer: 'InnerveX', recipient: 'Rahul Sellamuthu', date: '2024-08-10', status: 'pending', type: 'achievement' },
  ],
  addCertificate: (cert) => set((state) => ({ certificates: [cert, ...state.certificates] })),
  
  requests: [
    { id: 'req_1', title: 'Internship Completion', institution: 'Google', recipient: 'Rahul Sellamuthu', status: 'sent', date: '2024-09-01' },
    { id: 'req_2', title: 'Advanced AI Course', institution: 'DeepMind', recipient: 'Rahul Sellamuthu', status: 'approved', date: '2024-09-05' },
  ],

  addRequest: (request) => set((state) => ({ requests: [...state.requests, request] })),

  // Shared Certificates (Student -> Employer)
  shared: [],
  shareCertificate: (shareData) => set((state) => ({ shared: [shareData, ...state.shared] })),

  // Toast System
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));
