import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUserContext } from "@/service/types/User";

const initialUser: IUserContext = {
  id: "",
  name: "",
  email: "",
  role: "",
  office: null,
};

interface UserStore {
  user: IUserContext;
  setUser: (user: IUserContext) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: initialUser,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: initialUser }),
    }),
    { name: "user-storage" }
  )
);
