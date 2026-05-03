/**
 * CurriculoEditor — editor de currículo avulso (sem login).
 * Wrapper fino sobre CurriculoComposer com mode="guest":
 * estado local puro, sem persistência no Supabase.
 */
import CurriculoComposer from "@/components/curriculo/CurriculoComposer";

export default function CurriculoEditor() {
  return <CurriculoComposer mode="guest" />;
}
