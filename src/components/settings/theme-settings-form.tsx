"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateThemeAction } from "@/lib/actions/settings";

export function ThemeSettingsForm() {
  const { theme } = useTheme();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (theme === "light" || theme === "dark" || theme === "system") {
      void updateThemeAction(theme);
    }
  }, [theme]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Escolha entre tema claro, escuro ou automático conforme o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ThemeToggle />
      </CardContent>
    </Card>
  );
}
