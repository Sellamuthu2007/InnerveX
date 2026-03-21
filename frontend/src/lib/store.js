import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from './config';
import api from './api';

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
          const data = await api.getMyCertificates(token);
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
        } catch (e) {
          console.error('fetchMyCertificates error:', e);
          get().addToast(e.message || 'Failed to fetch certificates', 'error');
        }
      },

      // Revoke a certificate
      revokeCertificate: async (id, reason = '') => {
        const token = get().token;
        if (!token) return false;
        try {
          await api.revokeCertificate(id, reason, token);
          set((state) => ({
            certificates: state.certificates.map(c => c.id === id ? { ...c, status: 'revoked' } : c)
          }));
          get().addToast('Certificate permanently revoked', 'success');
          return true;
        } catch (e) {
          console.error('revokeCertificate error:', e);
          get().addToast(e.message || 'Failed to revoke certificate', 'error');
          return false;
        }
      },

      // Fetch certificates issued by the logged-in institution
      fetchIssuedCertificates: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const data = await api.getIssuedCertificates(token);
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
          
          set({ certificates: normalized });
        } catch (e) {
          console.error('fetchIssuedCertificates error:', e);
          get().addToast(e.message || 'Failed to fetch issued certificates', 'error');
        }
      },

      // ── Requests ────────────────────────────────────────────
      requests: [],

      // Fetch requests from DB for current logged-in user
      fetchMyRequests: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const data = await api.getMyRequests(token);
          const normalized = data.requests.map(r => ({
            id: r._id,
            title: r.title,
            institution: r.institutionName,
            recipient: r.recipientName,
            status: r.status,
            date: r.createdAt?.split('T')[0] || ''
          }));
          set({ requests: normalized });
        } catch (e) {
          console.error('fetchMyRequests error:', e);
          get().addToast(e.message || 'Failed to fetch requests', 'error');
        }
      },

      // Fetch requests from DB for current logged-in institution
      fetchInstitutionRequests: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const data = await api.getInstitutionRequests(token);
          const normalized = data.requests.map(r => ({
            id: r._id,
            title: r.title,
            institution: r.institutionName,
            recipient: r.recipientName,
            status: r.status,
            date: r.createdAt?.split('T')[0] || ''
          }));
          set({ requests: normalized });
        } catch (e) {
          console.error('fetchInstitutionRequests error:', e);
          get().addToast(e.message || 'Failed to fetch institution requests', 'error');
        }
      },

      addRequest: async (requestData) => {
        const token = get().token;
        if (!token) return;
        try {
          const data = await api.createRequest(requestData, token);
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
        } catch (e) {
          console.error('addRequest error:', e);
          get().addToast(e.message || 'Failed to send request', 'error');
        }
      },

      updateRequestStatus: async (id, status) => {
        const token = get().token;
        if (!token) return;
        try {
          await api.updateRequestStatus(id, status, token);
          set((state) => ({
            requests: state.requests.map(r => r.id === id ? { ...r, status } : r)
          }));
          get().addToast(`Request ${status}`, 'success');
        } catch (e) {
          console.error('updateRequestStatus error:', e);
          get().addToast(e.message || 'Failed to update status', 'error');
        }
      },

      // ── Shared Certificates ─────────────────────────────────
      shared: [],
      
      fetchSharedCertificates: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const data = await api.getMyShares(token);
          set({ shared: data.shares });
        } catch (e) {
          console.error('fetchSharedCertificates error:', e);
          get().addToast(e.message || 'Failed to fetch shared certificates', 'error');
        }
      },

      shareCertificate: async (shareData) => {
        const token = get().token;
        if (!token) return null;
        try {
          const result = await api.createShare(shareData, token);
          get().addToast('Certificate shared successfully', 'success');
          return result; // Return full result including shareUrl
        } catch (e) {
          console.error('shareCertificate error:', e);
          get().addToast(e.message || 'Failed to share certificate', 'error');
          return null;
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
