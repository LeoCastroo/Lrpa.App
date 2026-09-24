import { create } from "zustand";
import api from "@/api";
import { IServiceDefinition } from "@/service/types/Service";

interface ServicesStore {
  services: IServiceDefinition[];
  status: "idle" | "loading" | "loaded" | "error";
  fetch: () => Promise<void>;
  clear: () => void;
}

// Não persistido: revalidado a cada sessão para refletir mudanças de permissão.
export const useServicesStore = create<ServicesStore>((set, get) => ({
  services: [],
  status: "idle",
  fetch: async () => {
    const current = get().status;
    if (current === "loading" || current === "loaded") return;
    set({ status: "loading" });
    try {
      const services = await api.services.getServices();
      set({ services, status: "loaded" });
    } catch {
      set({ status: "error" });
    }
  },
  clear: () => set({ services: [], status: "idle" }),
}));
