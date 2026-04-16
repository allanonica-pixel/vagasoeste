import { useState } from "react";
import { mockAdminCompanies, mockAdminCandidates, mockAdminJobs, mockAdminNotifications } from "@/mocks/adminData";

// ... existing code ...

type Period = "7d" | "30d" | "90d" | "all";

// Mock data for pre-cadastro timeline
const PRE_CADASTRO_TIMELINE: Record<Period, { label: string; aprovados: number; rejeitados: number; pendentes: number }[]> = {
  "7d": [
    { label: "10/04", aprovados: 0, rejeitados: 0, pendentes: 1 },
    { label: "11/04", aprovados: 0, rejeitados: 0, pendentes: 0 },
    { label: "12/04", aprovados: 1, rejeitados: 0, pendentes: 0 },
    { label: "13/04", aprovados: 0, rejeitados: 0, pendentes: 0 },
    { label: "14/04", aprovados: 0, rejeitados: 0, pendentes: 1 },
    { label: "15/04", aprovados: 0, rejeitados: 0, pendentes: 1 },
    { label: "16/04", aprovados: 0, rejeitados: 0, pendentes: 2 },
  ],
  "30d": [
    { label: "Sem 1", aprovados: 1, rejeitados: 0, pendentes: 0 },
    { label: "Sem 2", aprovados: 2, rejeitados: 1, pendentes: 0 },
    { label: "Sem 3", aprovados: 1, rejeitados: 0, pendentes: 1 },
    { label: "Sem 4", aprovados: 0, rejeitados: 0, pendentes: 3 },
  ],
  "90d": [
    { label: "Jan", aprovados: 2, rejeitados: 0, pendentes: 0 },
    { label: "Fev", aprovados: 1, rejeitados: 1, pendentes: 0 },
    { label: "Mar", aprovados: 1, rejeitados: 0, pendentes: 0 },
    { label: "Abr", aprovados: 0, rejeitados: 0, pendentes: 4 },
  ],
  "all": [
    { label: "Jan", aprovados: 2, rejeitados: 0, pendentes: 0 },
    { label: "Fev", aprovados: 1, rejeitados: 1, pendentes: 0 },
    { label: "Mar", aprovados: 1, rejeitados: 0, pendentes: 0 },
    { label: "Abr", aprovados: 0, rejeitados: 0, pendentes: 4 },
  ],
};

export default function AdminReports() {
  const [period, setPeriod] = useState<Period>("30d");

  const totalJobs = mockAdminJobs.length;
  const activeJobs = mockAdminJobs.filter((j) => j.status === "ativa").length;
  const totalCandidates = mockAdminCandidates.length;
  const totalCompanies = mockAdminCompanies.length;
  const activeCompanies = mockAdminCompanies.filter((c) => c.status === "ativo").length;
  const pendingCompanies = mockAdminCompanies.filter((c) => c.status === "pendente").length;
  const rejectedCompanies = mockAdminCompanies.filter((c) => c.status === "rejeitado").length;
  const sentNotifications = mockAdminNotifications.filter((n) => n.status === "enviado").length;
  const pendingNotifications = mockAdminNotifications.filter((n) => n.status === "pendente").length;
  const failedNotifications = mockAdminNotifications.filter((n) => n.status === "falhou").length;
  const totalCandidaturas = mockAdminCandidates.reduce((acc, c) => acc + c.candidaturas, 0);

  const preCadastroData = PRE_CADASTRO_TIMELINE[period];
  const maxPreCadastro = Math.max(...preCadastroData.map((d) => d.aprovados + d.rejeitados + d.pendentes), 1);
  const totalAprovados = mockAdminCompanies.filter((c) => c.status === "ativo").length;
  const totalRejeitados = mockAdminCompanies.filter((c) => c.status === "rejeitado").length;
  const totalPreCadastros = totalCompanies;
  const taxaAprovacao = totalPreCadastros > 0 ? Math.round((totalAprovados / totalPreCadastros) * 100) : 0;

  // ... existing code ...

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Relatórios e Métricas</h2>
          <p className="text-gray-700 text-sm mt-0.5">Visão geral do ecossistema VagasOeste</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                period === p ? "bg-white text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : p === "90d" ? "90 dias" : "Tudo"}
            </button>
          ))}
        </div>
      </div>

      {/* === PRÉ-CADASTROS POR PERÍODO === */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-900 mb-1">Pré-cadastros de Empresas</h3>
        <p className="text-xs text-gray-500 mb-4">Evolução de aprovações, rejeições e pendências por período</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Summary cards */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-emerald-600 text-base"></i>
              </div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Aprovados</p>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{totalAprovados}</p>
            <p className="text-xs text-emerald-600 mt-1">Taxa de aprovação: <strong>{taxaAprovacao}%</strong></p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <i className="ri-close-circle-line text-red-500 text-base"></i>
              </div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Rejeitados</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{totalRejeitados}</p>
            <p className="text-xs text-red-500 mt-1">
              {totalPreCadastros > 0 ? Math.round((totalRejeitados / totalPreCadastros) * 100) : 0}% do total
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <i className="ri-time-line text-amber-600 text-base"></i>
              </div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Pendentes</p>
            </div>
            <p className="text-3xl font-bold text-amber-600">{pendingCompanies}</p>
            <p className="text-xs text-amber-600 mt-1">Aguardando validação</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Pré-cadastros por período</p>
              <p className="text-xs text-gray-500 mt-0.5">Aprovados, rejeitados e pendentes</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                <span className="text-xs text-gray-500">Aprovados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-400"></div>
                <span className="text-xs text-gray-500">Rejeitados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
                <span className="text-xs text-gray-500">Pendentes</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3 h-40">
            {preCadastroData.map((d) => {
              const total = d.aprovados + d.rejeitados + d.pendentes;
              const maxH = 120; // px
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-32">
                    {/* Aprovados */}
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="w-full bg-emerald-500 rounded-t-sm transition-all"
                        style={{ height: total > 0 ? `${(d.aprovados / maxPreCadastro) * maxH}px` : "0px" }}
                        title={`Aprovados: ${d.aprovados}`}
                      ></div>
                    </div>
                    {/* Rejeitados */}
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="w-full bg-red-400 rounded-t-sm transition-all"
                        style={{ height: total > 0 ? `${(d.rejeitados / maxPreCadastro) * maxH}px` : "0px" }}
                        title={`Rejeitados: ${d.rejeitados}`}
                      ></div>
                    </div>
                    {/* Pendentes */}
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="w-full bg-amber-400 rounded-t-sm transition-all"
                        style={{ height: total > 0 ? `${(d.pendentes / maxPreCadastro) * maxH}px` : "2px" }}
                        title={`Pendentes: ${d.pendentes}`}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{d.label}</span>
                </div>
              );
            })}
          </div>

          {/* Totals row */}
          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-emerald-600">{preCadastroData.reduce((a, d) => a + d.aprovados, 0)}</p>
              <p className="text-xs text-gray-400">Aprovados no período</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">{preCadastroData.reduce((a, d) => a + d.rejeitados, 0)}</p>
              <p className="text-xs text-gray-400">Rejeitados no período</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-500">{preCadastroData.reduce((a, d) => a + d.pendentes, 0)}</p>
              <p className="text-xs text-gray-400">Pendentes no período</p>
            </div>
          </div>
        </div>
      </div>

      {/* === EMAIL NOTIFICATIONS STATUS === */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-900 mb-1">Notificações por Email</h3>
        <p className="text-xs text-gray-500 mb-4">Status dos emails automáticos enviados pela plataforma</p>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
            {[
              { label: "Enviados", value: sentNotifications, icon: "ri-send-plane-line", color: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" },
              { label: "Pendentes", value: pendingNotifications, icon: "ri-time-line", color: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-400" },
              { label: "Falhou", value: failedNotifications, icon: "ri-error-warning-line", color: "text-red-500", bg: "bg-red-50", bar: "bg-red-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <i className={`${item.icon} ${item.color} text-lg`}></i>
                </div>
                <div className="flex-1">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.bar}`}
                      style={{ width: mockAdminNotifications.length > 0 ? `${(item.value / mockAdminNotifications.length) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email types breakdown */}
          <div className="border-t border-gray-50 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Por tipo de notificação</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { type: "new_candidate", label: "Novo candidato", icon: "ri-user-add-line", color: "text-sky-600", bg: "bg-sky-50" },
                { type: "pre_interview", label: "Pré-entrevista", icon: "ri-calendar-check-line", color: "text-amber-600", bg: "bg-amber-50" },
                { type: "company_approved", label: "Empresa aprovada", icon: "ri-checkbox-circle-line", color: "text-emerald-600", bg: "bg-emerald-50" },
                { type: "company_rejected", label: "Empresa rejeitada", icon: "ri-close-circle-line", color: "text-red-500", bg: "bg-red-50" },
                { type: "job_approved", label: "Vaga aprovada", icon: "ri-briefcase-line", color: "text-teal-600", bg: "bg-teal-50" },
                { type: "job_rejected", label: "Vaga rejeitada", icon: "ri-briefcase-2-line", color: "text-orange-500", bg: "bg-orange-50" },
              ].map((item) => {
                const count = mockAdminNotifications.filter((n) => n.type === item.type).length;
                return (
                  <div key={item.type} className={`${item.bg} rounded-xl p-3 flex items-center gap-2.5`}>
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      <i className={`${item.icon} ${item.color} text-sm`}></i>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${item.color}`}>{count}</p>
                      <p className="text-xs text-gray-500 leading-tight">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Integration status */}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <i className="ri-mail-settings-line text-amber-600 text-base"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Integração de email pendente</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Conecte o Supabase e configure a chave <code className="bg-amber-100 px-1 rounded text-xs">RESEND_API_KEY</code> nas Edge Functions para ativar o envio real de emails.
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-1 rounded-full whitespace-nowrap">Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Empresas Ativas", value: activeCompanies, total: totalCompanies, icon: "ri-building-line", color: "text-emerald-600", bg: "bg-emerald-50", trend: "+2 este mês" },
          { label: "Candidatos", value: totalCandidates, total: null, icon: "ri-user-line", color: "text-sky-600", bg: "bg-sky-50", trend: "+5 esta semana" },
          { label: "Vagas Ativas", value: activeJobs, total: totalJobs, icon: "ri-briefcase-line", color: "text-amber-600", bg: "bg-amber-50", trend: `${totalJobs - activeJobs} pausadas` },
          { label: "Candidaturas", value: totalCandidaturas, total: null, icon: "ri-send-plane-line", color: "text-violet-600", bg: "bg-violet-50", trend: `${sentNotifications} notificações` },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <i className={`${kpi.icon} ${kpi.color} text-lg`}></i>
            </div>
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            {kpi.total && <p className="text-xs text-gray-400">de {kpi.total} total</p>}
            <p className="text-xs text-gray-700 mt-1">{kpi.label}</p>
            <p className="text-xs text-gray-600 mt-1">{kpi.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Monthly Candidatures Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Candidaturas por Mês</h3>
          <p className="text-xs text-gray-600 mb-5">Evolução mensal de candidaturas e vagas publicadas</p>
          <div className="flex items-end gap-4 h-36">
            {[
              { month: "Jan", candidaturas: 12, vagas: 3 },
              { month: "Fev", candidaturas: 18, vagas: 5 },
              { month: "Mar", candidaturas: 24, vagas: 7 },
              { month: "Abr", candidaturas: totalCandidaturas, vagas: activeJobs },
            ].map((d) => {
              const maxMonthly = Math.max(12, 18, 24, totalCandidaturas, 1);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-1 h-28">
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="w-full bg-emerald-500 rounded-t-md transition-all" style={{ height: `${(d.candidaturas / maxMonthly) * 100}%` }}></div>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="w-full bg-amber-400 rounded-t-md transition-all" style={{ height: `${(d.vagas / maxMonthly) * 100}%` }}></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
              <span className="text-xs text-gray-600">Candidaturas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
              <span className="text-xs text-gray-600">Vagas publicadas</span>
            </div>
          </div>
        </div>

        {/* Candidate Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Candidatos por Status</h3>
          <p className="text-xs text-gray-600 mb-5">Distribuição atual dos candidatos no funil</p>
          <div className="space-y-3">
            {(Object.entries({
              pendente: 2,
              em_analise: 1,
              pre_entrevista: 1,
              aprovado: 1,
              reprovado: 0,
              contratado: 1,
            }) as [string, number][])
              .filter(([, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => {
                const total = 6;
                const pct = Math.round((count / total) * 100);
                const labels: Record<string, string> = {
                  pendente: "Pendente", em_analise: "Em Análise", pre_entrevista: "Pré-Entrevista",
                  aprovado: "Aprovado", reprovado: "Reprovado", contratado: "Contratado",
                };
                const colors: Record<string, string> = {
                  pendente: "bg-gray-400", em_analise: "bg-amber-400", pre_entrevista: "bg-sky-400",
                  aprovado: "bg-emerald-500", reprovado: "bg-red-400", contratado: "bg-teal-500",
                };
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-800">{labels[status] || status}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{pct}%</span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${colors[status] || "bg-gray-400"}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vagas por Setor */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Vagas por Setor</h3>
          <p className="text-xs text-gray-600 mb-5">Distribuição das vagas publicadas por setor</p>
          <div className="space-y-3">
            {(() => {
              const sectorCounts: Record<string, number> = {};
              mockAdminJobs.forEach((j) => { sectorCounts[j.sector] = (sectorCounts[j.sector] || 0) + 1; });
              const entries = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);
              const max = Math.max(...Object.values(sectorCounts), 1);
              const colors: Record<string, string> = {
                "Comércio": "bg-sky-500", "Saúde": "bg-rose-500", "Tecnologia": "bg-violet-500",
                "Construção Civil": "bg-amber-500", "Alimentação": "bg-orange-500", "Logística": "bg-teal-500",
                "Serviços": "bg-emerald-500", "Indústria": "bg-gray-500", "Agronegócio": "bg-lime-500",
              };
              const textColors: Record<string, string> = {
                "Comércio": "text-sky-600", "Saúde": "text-rose-600", "Tecnologia": "text-violet-600",
                "Construção Civil": "text-amber-600", "Alimentação": "text-orange-600", "Logística": "text-teal-600",
                "Serviços": "text-emerald-600", "Indústria": "text-gray-600", "Agronegócio": "text-lime-600",
              };
              return entries.map(([sector, count]) => (
                <div key={sector}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${textColors[sector] || "text-gray-700"}`}>{sector}</span>
                    <span className="text-sm font-semibold text-gray-900">{count} vaga{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[sector] || "bg-emerald-500"} transition-all`} style={{ width: `${(count / max) * 100}%` }}></div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Candidatos por Escolaridade */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Candidatos por Escolaridade</h3>
          <p className="text-xs text-gray-600 mb-5">Nível de escolaridade dos candidatos cadastrados</p>
          <div className="space-y-3">
            {(() => {
              const eduCounts: Record<string, number> = {};
              mockAdminCandidates.forEach((c) => { eduCounts[c.educationLevel] = (eduCounts[c.educationLevel] || 0) + 1; });
              const entries = Object.entries(eduCounts).sort((a, b) => b[1] - a[1]);
              const max = Math.max(...Object.values(eduCounts), 1);
              return entries.map(([edu, count]) => (
                <div key={edu}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-800">{edu}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(count / max) * 100}%` }}></div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Top Companies & Top Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Empresas Mais Ativas</h3>
          <p className="text-xs text-gray-600 mb-5">Empresas com mais candidatos recebidos</p>
          <div className="space-y-4">
            {[...mockAdminCompanies].sort((a, b) => b.totalCandidates - a.totalCandidates).slice(0, 5).map((company, i) => {
              const max = Math.max(...mockAdminCompanies.map((c) => c.totalCandidates), 1);
              return (
                <div key={company.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4 shrink-0">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{company.name}</span>
                      <span className="text-xs text-gray-700">{company.totalCandidates} candidatos</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(company.totalCandidates / max) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{company.sector} · {company.activeJobs} vagas ativas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-1">Vagas Mais Procuradas</h3>
          <p className="text-xs text-gray-600 mb-5">Vagas com maior número de candidatos</p>
          <div className="space-y-4">
            {[...mockAdminJobs].sort((a, b) => b.candidates - a.candidates).slice(0, 5).map((job, i) => {
              const max = Math.max(...mockAdminJobs.map((j) => j.candidates), 1);
              return (
                <div key={job.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4 shrink-0">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{job.title}</span>
                      <span className="text-xs text-gray-700">{job.candidates} candidatos</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${(job.candidates / max) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{job.company} · {job.sector}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Resumo por Empresa</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Empresa</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Setor</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Vagas</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Candidatos</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Taxa</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockAdminCompanies.map((company) => {
                const rate = company.activeJobs > 0 ? Math.round(company.totalCandidates / company.activeJobs) : 0;
                const textColors: Record<string, string> = {
                  "Comércio": "text-sky-600", "Saúde": "text-rose-600", "Tecnologia": "text-violet-600",
                  "Construção Civil": "text-amber-600", "Alimentação": "text-orange-600", "Logística": "text-teal-600",
                  "Serviços": "text-emerald-600", "Indústria": "text-gray-600", "Agronegócio": "text-lime-600",
                };
                return (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{company.name}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold ${textColors[company.sector] || "text-gray-600"}`}>{company.sector}</span>
                    </td>
                    <td className="py-3 text-center text-gray-800 font-semibold">{company.activeJobs}</td>
                    <td className="py-3 text-center text-gray-800 font-semibold">{company.totalCandidates}</td>
                    <td className="py-3 text-center">
                      <span className="text-xs text-gray-700">{rate}/vaga</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        company.status === "ativo" ? "bg-emerald-100 text-emerald-700" :
                        company.status === "pendente" ? "bg-amber-100 text-amber-700" :
                        company.status === "rejeitado" ? "bg-red-100 text-red-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {company.status === "ativo" ? "Ativo" : company.status === "pendente" ? "Pendente" : company.status === "rejeitado" ? "Rejeitado" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
