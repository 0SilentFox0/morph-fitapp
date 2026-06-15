import { api } from './client';

export const acceptInvitation = (code: string) => api.post(`/client-invitations/${code}/accept`);

export const revokeInvitation = (invitation: string) =>
  api.delete(`/client-invitations/${invitation}`);
