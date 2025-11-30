import { useTheme } from "@/hooks/useTheme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useTheme();

  return (
    {children}
  );
}
