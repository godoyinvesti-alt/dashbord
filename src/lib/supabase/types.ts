// Este arquivo mapeia manualmente as tabelas do Supabase para tipos TypeScript.
// Caso deseje, gere tipos automaticamente com:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Usamos `any` controlado aqui apenas como fallback estrutural — as tabelas
// reais são tipadas em src/lib/types.ts e usadas nas camadas de acesso a dados.
export type Database = Record<string, unknown>;
