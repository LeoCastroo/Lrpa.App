import api from "@/service/api";
import { ICreateUserInput, IOfficeUserSummary } from "@/service/types/AdminUser";

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

export default { listUsers, createUser, setUserServices };
