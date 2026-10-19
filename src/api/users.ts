import api from "@/service/api";
import { ICreateUserInput, IOfficeUserSummary } from "@/service/types/AdminUser";
import { IUserVaultAccess } from "@/service/types/Credential";

async function listUsers(office: string): Promise<IOfficeUserSummary[]> {
  const { data } = await api.get(`/users`, { params: { office } });
  return data;
}

async function createUser(
  input: ICreateUserInput
): Promise<{ id: string; name: string; email: string }> {
  const { data } = await api.post(`/users`, input);
  return data;
}

async function setUserServices(id: string, serviceKeys: string[]): Promise<void> {
  await api.put(`/users/${id}/services`, { serviceKeys });
}

async function getVaultAccess(id: string): Promise<IUserVaultAccess> {
  const { data } = await api.get(`/users/${id}/vault-access`);
  return data;
}

async function setVaultAccess(
  id: string,
  input: { hasVaultAccess: boolean; credentialIds: string[] }
): Promise<void> {
  await api.put(`/users/${id}/vault-access`, input);
}

export default { listUsers, createUser, setUserServices, getVaultAccess, setVaultAccess };
