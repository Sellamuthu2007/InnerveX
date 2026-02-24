import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from './config';

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ────────────────────────────────────────────────
      user: null,
      token: null,
      userRole: null,
      userId: null,
      name: '',
      walletId: '',

      theme: 'dark', // Default to dark mode
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setUser: (userData) => set((state) => ({
        ...state,
        user: userData,
        userRole: userData?.role || state.userRole,
        userId: userData?._id || state.userId,
        name: userData?.name || state.name,
        walletId: userData?.walletId || state.walletId,
      })),

      setToken: (token) => set({ token }),

      setRole: (role) => set({ userRole: role }),

      isAuthenticated: () => !!(get().token && get().user),

      logout: () => set({
        user: null,
        token: null,
        userRole: null,
        userId: null,
        name: '',
        walletId: '',
      }),

      // ── Certificates ────────────────────────────────────────
      certificates: [],
      addCertificate: (cert) => set((state) => ({ certificates: [cert, ...state.certificates] })),

      // Fetch certificates from DB for current logged-in user
      fetchMyCertificates: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/certificates/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            // Normalize DB certs to the shape the rest of the app expects
            const normalized = data.certificates.map(c => ({
              id: c._id,
              title: c.title,
              issuer: c.issuerName,
              recipient: c.recipientName,
              date: c.createdAt?.split('T')[0] || '',
              status: c.status,
              type: 'received',
              fileData: c.fileData || null,
              fileName: c.fileName || null,
              fileType: c.fileType || null,
            }));
            set({ certificates: normalized });
          }
        } catch (e) {
          console.error('fetchMyCertificates error:', e);
        }
      },

      // Revoke a certificate
      revokeCertificate: async (id) => {
        const token = get().token;
        if (!token) return false;
        try {
          const res = await fetch(`${API_URL}/api/certificates/${id}/revoke`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            set((state) => ({
              certificates: state.certificates.map(c => c.id === id ? { ...c, status: 'revoked' } : c)
            }));
            get().addToast('Certificate permanently revoked', 'success');
            return true;
          } else {
            get().addToast(data.message || 'Failed to revoke certificate', 'error');
            return false;
          }
        } catch (e) {
          console.error('revokeCertificate error:', e);
          get().addToast('Error communicating with server', 'error');
          return false;
        }
      },

      // Fetch certificates issued by the logged-in institution
      fetchIssuedCertificates: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/certificates/issued`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            // Normalize DB certs to the shape the rest of the app expects
            const normalized = data.certificates.map(c => ({
              id: c._id,
              title: c.title,
              issuer: c.issuerName,
              recipient: c.recipientName,
              date: c.createdAt?.split('T')[0] || '',
              status: c.status,
              type: 'issued', // Indicate these were issued by the user
              fileData: c.fileData || null,
              fileName: c.fileName || null,
              fileType: c.fileType || null,
            }));
            
            // We shouldn't overwrite received certificates. 
            // Better to merge or maintain separate lists, but for now we'll overwrite 
            // since a user is usually EITHER an institution OR an individual
            set({ certificates: normalized });
          }
        } catch (e) {
          console.error('fetchIssuedCertificates error:', e);
        }
      },

      // ── Requests ────────────────────────────────────────────
      requests: [],

      // Fetch requests from DB for current logged-in user
      fetchMyRequests: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/requests/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            const normalized = data.requests.map(r => ({
              id: r._id,
              title: r.title,
              institution: r.institutionName,
              recipient: r.recipientName,
              status: r.status,
              date: r.createdAt?.split('T')[0] || ''
            }));
            set({ requests: normalized });
          }
        } catch (e) {
          console.error('fetchMyRequests error:', e);
        }
      },

      // Fetch requests from DB for current logged-in institution
      fetchInstitutionRequests: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/requests/institution`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            const normalized = data.requests.map(r => ({
              id: r._id,
              title: r.title,
              institution: r.institutionName,
              recipient: r.recipientName,
              status: r.status,
              date: r.createdAt?.split('T')[0] || ''
            }));
            set({ requests: normalized });
          }
        } catch (e) {
          console.error('fetchInstitutionRequests error:', e);
        }
      },

      addRequest: async (requestData) => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/requests`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(requestData)
          });
          const data = await res.json();
          if (res.ok) {
            const newReq = {
              id: data.request._id,
              title: data.request.title,
              institution: data.request.institutionName,
              recipient: data.request.recipientName,
              status: data.request.status,
              date: data.request.createdAt?.split('T')[0] || ''
            };
            set((state) => ({ requests: [newReq, ...state.requests] }));
            get().addToast('Request sent successfully', 'success');
          } else {
            get().addToast(data.message || 'Failed to send request', 'error');
          }
        } catch (e) {
          console.error('addRequest error:', e);
          get().addToast('Error saving request', 'error');
        }
      },

      updateRequestStatus: async (id, status) => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/requests/${id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ status })
          });
          if (res.ok) {
            set((state) => ({
              requests: state.requests.map(r => r.id === id ? { ...r, status } : r)
            }));
            get().addToast(`Request ${status}`, 'success');
          }
        } catch (e) {
          console.error('updateRequestStatus error:', e);
          get().addToast('Error updating status', 'error');
        }
      },

      // ── Shared Certificates ─────────────────────────────────
      shared: [],
      
      fetchSharedCertificates: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/shares/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            set({ shared: data.shares });
          }
        } catch (e) {
          console.error('fetchSharedCertificates error:', e);
        }
      },

      shareCertificate: async (shareData) => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/api/shares`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(shareData)
          });
          const data = await res.json();
          if (res.ok) {
            get().addToast('Certificate shared successfully', 'success');
            return true;
          } else {
            get().addToast(data.message || 'Failed to share certificate', 'error');
            return false;
          }
        } catch (e) {
          console.error('shareCertificate error:', e);
          get().addToast('Error sharing certificate', 'error');
          return false;
        }
      },

      // ── Toast System ────────────────────────────────────────
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
        }, 3000);
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
    }),
    {
      name: 'innervex-storage', // localStorage key
      partialize: (state) => ({
        // Persist auth and important data objects
        user: state.user,
        token: state.token,
        userRole: state.userRole,
        userId: state.userId,
        name: state.name,
        walletId: state.walletId,
        theme: state.theme,
        certificates: state.certificates,
        requests: state.requests,
        shared: state.shared,
      }),
    }
  )
);
