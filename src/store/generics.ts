import { create } from "zustand";

interface GenericsStore {
  isLoading: boolean;
  isSubmitting: boolean;
  pageTitle: string | null;
  setIsLoading: (value: boolean) => void;
  setIsSubmitting: (value: boolean) => void;
  setPageTitle: (value: string | null) => void;
}

export const useGenericsStore = create<GenericsStore>()((set) => ({
  isLoading: false,
  isSubmitting: false,
  pageTitle: null,
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setPageTitle: (pageTitle) => set({ pageTitle }),
}));
