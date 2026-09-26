import api from "@/service/api";
import { IUserContext } from "@/service/types/User";

async function getMe(): Promise<IUserContext> {
  const { data } = await api.get(`/me`);
  return data;
}

async function changePassword(current_password: string, new_password: string): Promise<void> {
  await api.post(`/me/password`, { current_password, new_password });
}

export default { getMe, changePassword };
