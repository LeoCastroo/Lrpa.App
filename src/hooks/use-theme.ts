import { create } from "zustand";

// "gray" é uma variação do escuro (fundo/texto num cinza intermediário em vez de preto/branco
// puro) — reaproveita todo o dark: dos componentes shadcn (aplica a classe "dark" também) e só
// sobrescreve os tokens acromáticos em ".dark.theme-gray" no globals.css.
export type Theme = "dark" | "light" | "gray" | "auto";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved =
    theme === "auto"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
  root.classList.toggle("dark", resolved === "dark" || resolved === "gray");
  root.classList.toggle("theme-gray", resolved === "gray");
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
