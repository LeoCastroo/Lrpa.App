import { create } from "zustand";

export type Theme = "dark" | "light" | "auto";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Zustand (não useState local): a Toaster e a tela de Conta chamam useTheme() em componentes
// diferentes e precisam enxergar a mesma troca de tema na hora, não só depois de um reload.
const useThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem("theme") as Theme | null) ?? "auto",
  setTheme: (theme) => {
    applyTheme(theme);
    if (theme === "auto") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
    set({ theme });
  },
}));

export function useTheme() {
  return useThemeStore();
}
