import api from "@/service/api";
import {
  ICredentialAuditEntry,
  ICreateCredentialInput,
  ICredentialSummary,
  IListCredentialsResponse,
  IUpdateCredentialInput,
} from "@/service/types/Credential";

async function listCredentials(params: {
  page?: number;
  limit?: number;
  client_key?: string;
  status?: string;
}): Promise<IListCredentialsResponse> {
  const { data } = await api.get(`/credentials`, { params });
  return data;
}

async function getCredential(id: string): Promise<ICredentialSummary> {
  const { data } = await api.get(`/credentials/${id}`);
  return data;
}

async function createCredential(input: ICreateCredentialInput): Promise<ICredentialSummary> {
  const { data } = await api.post(`/credentials`, input);
  return data;
}

async function updateCredential(id: string, input: IUpdateCredentialInput): Promise<ICredentialSummary> {
  const { data } = await api.put(`/credentials/${id}`, input);
  return data;
}

async function revealPassword(id: string): Promise<{ password: string }> {
  const { data } = await api.post(`/credentials/${id}/reveal`);
  return data;
}

async function listAudit(id: string): Promise<ICredentialAuditEntry[]> {
  const { data } = await api.get(`/credentials/${id}/audit`);
  return data;
}

export default {
  listCredentials,
  getCredential,
  createCredential,
  updateCredential,
  revealPassword,
  listAudit,
};
