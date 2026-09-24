import api from "@/service/api";
import { IUserContext } from "@/service/types/User";

async function getMe(): Promise<IUserContext> {
  const { data } = await api.get(`/me`);
  return data;
}

export default { getMe };
