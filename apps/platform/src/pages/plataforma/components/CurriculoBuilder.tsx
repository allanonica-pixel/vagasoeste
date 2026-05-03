/**
 * CurriculoBuilder — aba "Meu Currículo" da Plataforma do Candidato.
 * Wrapper fino sobre CurriculoComposer com mode="authenticated":
 * carrega e salva curriculo_data (JSONB) no Supabase.
 */
import CurriculoComposer from "@/components/curriculo/CurriculoComposer";

export default function CurriculoBuilder() {
  return <CurriculoComposer mode="authenticated" />;
}
