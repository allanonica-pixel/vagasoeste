import { useState } from "react";

// ─── Default design tokens ───────────────────────────────────────────────────
const DEFAULT_DESIGN = {
  primaryColor: "#059669",       // emerald-600
  primaryDark: "#047857",        // emerald-700
  primaryLight: "#d1fae5",       // emerald-100
  primaryText: "#065f46",        // emerald-900
  buttonColor: "#059669",
  buttonTextColor: "#ffffff",
  navbarBg: "#ffffff",
  footerBg: "#f0fdf4",
  accentColor: "#f59e0b",        // amber
  fontColor: "#111827",          // gray-900
  heroHomeUrl: "https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20Amazon%20river%20city%20panoramic%20view%20tropical%20landscape%20warm%20golden%20hour%20light%20professional%20photography%20wide%20angle&width=1920&height=700&seq=hero-home-default&orientation=landscape",
  heroCurriculoUrl: "https://readdy.ai/api/search-image?query=professional%20resume%20curriculum%20vitae%20document%20on%20clean%20white%20desk%20with%20pen%20notebook%20laptop%20modern%20minimal%20office%20workspace%20warm%20light%20top%20view&width=1920&height=700&seq=curriculo-hero&orientation=landscape",
  heroEmpresasUrl: "https://readdy.ai/api/search-image?query=modern%20professional%20office%20environment%20with%20team%20working%20together%20in%20a%20bright%20open%20space%2C%20warm%20natural%20light%2C%20minimalist%20design%2C%20green%20plants%2C%20collaborative%20workspace%2C%20high%20quality%20corporate%20photography%2C%20clean%20white%20walls%2C%20wooden%20furniture&width=1440&height=700&seq=pe-hero-1&orientation=landscape",
};

type DesignConfig = typeof DEFAULT_DESIGN;

type SettingsTab = "geral" | "notificacoes" | "acessos" | "design";

const TAB_CONFIG: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "geral", label: "Geral", icon: "ri-settings-line" },
  { id: "notificacoes", label: "Notificações", icon: "ri-notification-line" },
  { id: "acessos", label: "Acessos", icon: "ri-lock-line" },
  { id: "design", label: "Design", icon: "ri-palette-line" },
];

// ─── Color Picker Row ─────────────────────────────────────────────────────────
function ColorRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
          style={{ backgroundColor: value }}
        ></div>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
          title={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="w-24 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-emerald-400 font-mono"
        />
      </div>
    </div>
  );
}

// ─── Image URL Row ────────────────────────────────────────────────────────────
function ImageUrlRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className="text-xs text-emerald-600 hover:underline cursor-pointer whitespace-nowrap shrink-0"
        >
          {preview ? "Ocultar prévia" : "Ver prévia"}
        </button>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-link text-gray-400 text-xs"></i>
          </div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg pl-8 pr-3 py-2 text-xs text-gray-700 outline-none focus:border-emerald-400"
          />
        </div>
        {value && (
          <button
            onClick={() => onChange("")}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-colors shrink-0"
            title="Limpar URL"
          >
            <i className="ri-close-line text-gray-400 dark:text-gray-500 text-sm"></i>
          </button>
        )}
      </div>
      {preview && value && (
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 h-32">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      {preview && !value && (
        <div className="mt-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 h-20 flex items-center justify-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">Nenhuma URL inserida</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("geral");

  // General
  const [platformName, setPlatformName] = useState("VagasOeste");
  const [adminEmail, setAdminEmail] = useState("vagas@email.com");
  const [whatsappNumber, setWhatsappNumber] = useState("93999999999");
  const [curriculoPrice, setCurriculoPrice] = useState("9.90");

  // Notifications
  const [autoNotify, setAutoNotify] = useState(true);
  const [notifyCompanyOnApply, setNotifyCompanyOnApply] = useState(true);
  const [notifyCandidateOnAction, setNotifyCandidateOnAction] = useState(true);

  // Design
  const [design, setDesign] = useState<DesignConfig>({ ...DEFAULT_DESIGN });
  const [designRestored, setDesignRestored] = useState(false);

  const [saved, setSaved] = useState(false);

  const updateDesign = (key: keyof DesignConfig, value: string) => {
    setDesign((prev) => ({ ...prev, [key]: value }));
  };

  const handleRestoreDesign = () => {
    setDesign({ ...DEFAULT_DESIGN });
    setDesignRestored(true);
    setTimeout(() => setDesignRestored(false), 2500);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configurações da Plataforma</h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm mt-0.5">Gerencie as configurações gerais do ecossistema VagasOeste</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-checkbox-circle-line text-emerald-600 text-sm"></i>
          </div>
          <p className="text-emerald-700 text-sm font-medium">Configurações salvas com sucesso!</p>
        </div>
      )}

      {designRestored && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-refresh-line text-sky-600 text-sm"></i>
          </div>
          <p className="text-sky-700 text-sm font-medium">Design restaurado para o padrão original!</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit flex-wrap">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${tab.icon} text-xs`}></i>
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: GERAL ── */}
      {activeTab === "geral" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-settings-line text-emerald-600 text-sm"></i>
              </div>
              Configurações Gerais
            </h3>
            <div className="space-y-4">
              {[
                { label: "Nome da Plataforma", value: platformName, setter: setPlatformName, type: "text" },
                { label: "Email Administrativo", value: adminEmail, setter: setAdminEmail, type: "email" },
                { label: "WhatsApp Administrativo", value: whatsappNumber, setter: setWhatsappNumber, type: "text" },
                { label: "Preço do Currículo (R$)", value: curriculoPrice, setter: setCurriculoPrice, type: "text" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-shield-check-line text-emerald-600 text-sm"></i>
              </div>
              Privacidade e Proteção de Dados
            </h3>
            <div className="space-y-3">
              {[
                { label: "Dados pessoais dos candidatos", desc: "Nome, telefone e email são visíveis apenas para administradores VagasOeste", active: true },
                { label: "Perfil anônimo para empresas", desc: "Empresas veem apenas bairro, idade, sexo e PCD — sem identificação", active: true },
                { label: "Intermediação obrigatória", desc: "Todo contato entre empresa e candidato passa pela equipe VagasOeste", active: true },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                    <i className="ri-checkbox-circle-fill text-emerald-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: NOTIFICAÇÕES ── */}
      {activeTab === "notificacoes" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 max-w-xl">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-notification-line text-emerald-600 text-sm"></i>
            </div>
            Notificações Automáticas
          </h3>
          <div className="space-y-5">
            {[
              { label: "Ativar notificações automáticas", desc: "Habilita o sistema de notificações automáticas", value: autoNotify, setter: setAutoNotify },
              { label: "Notificar empresa ao receber candidato", desc: "Envia email para a empresa quando alguém se candidata (sem dados pessoais)", value: notifyCompanyOnApply, setter: setNotifyCompanyOnApply },
              { label: "Notificar candidato em ações", desc: "Envia email e WhatsApp ao candidato quando há pré-entrevista ou contato solicitado", value: notifyCandidateOnAction, setter: setNotifyCandidateOnAction },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.setter(!item.value)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${item.value ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value ? "translate-x-5" : "translate-x-0.5"}`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: ACESSOS ── */}
      {activeTab === "acessos" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 max-w-xl">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-lock-line text-emerald-600 text-sm"></i>
            </div>
            Acessos e Credenciais
          </h3>
          <div className="space-y-3">
            {[
              { role: "Administrador", email: "vagas@email.com", access: "Acesso total" },
              { role: "Empresa (demo)", email: "empresa@email.com", access: "Painel da empresa" },
              { role: "Candidato (demo)", email: "candidato@email.com", access: "Plataforma do candidato" },
            ].map((user) => (
              <div key={user.role} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.role}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">{user.access}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">Senha padrão de demonstração: <strong>vagasoeste</strong></p>
        </div>
      )}

      {/* ── TAB: DESIGN ── */}
      {activeTab === "design" && (
        <div className="space-y-6">
          {/* Header with restore button */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Personalização Visual</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ajuste cores, fontes e imagens do site e da plataforma</p>
            </div>
            <button
              onClick={handleRestoreDesign}
              className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-refresh-line text-sm"></i>
              </div>
              Restaurar Design Padrão
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colors — Primary */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2 text-sm">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-palette-line text-emerald-600 text-sm"></i>
                </div>
                Cores Primárias
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Cores principais usadas em botões, links e destaques</p>
              <div>
                <ColorRow
                  label="Cor Principal"
                  desc="Botões, links e elementos de destaque"
                  value={design.primaryColor}
                  onChange={(v) => updateDesign("primaryColor", v)}
                />
                <ColorRow
                  label="Cor Principal Escura"
                  desc="Hover de botões e elementos ativos"
                  value={design.primaryDark}
                  onChange={(v) => updateDesign("primaryDark", v)}
                />
                <ColorRow
                  label="Cor Principal Clara"
                  desc="Fundos de badges e tags"
                  value={design.primaryLight}
                  onChange={(v) => updateDesign("primaryLight", v)}
                />
                <ColorRow
                  label="Cor de Texto Principal"
                  desc="Texto sobre fundos coloridos"
                  value={design.primaryText}
                  onChange={(v) => updateDesign("primaryText", v)}
                />
                <ColorRow
                  label="Cor de Destaque (Accent)"
                  desc="Badges especiais, estrelas, destaques secundários"
                  value={design.accentColor}
                  onChange={(v) => updateDesign("accentColor", v)}
                />
              </div>
            </div>

            {/* Colors — Buttons & Bars */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2 text-sm">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-layout-line text-emerald-600 text-sm"></i>
                </div>
                Botões, Barras e Fontes
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Cores de botões, navbar, footer e texto geral</p>
              <div>
                <ColorRow
                  label="Cor dos Botões"
                  desc="Fundo dos botões de ação principal"
                  value={design.buttonColor}
                  onChange={(v) => updateDesign("buttonColor", v)}
                />
                <ColorRow
                  label="Texto dos Botões"
                  desc="Cor do texto dentro dos botões"
                  value={design.buttonTextColor}
                  onChange={(v) => updateDesign("buttonTextColor", v)}
                />
                <ColorRow
                  label="Fundo da Navbar"
                  desc="Cor de fundo da barra de navegação"
                  value={design.navbarBg}
                  onChange={(v) => updateDesign("navbarBg", v)}
                />
                <ColorRow
                  label="Fundo do Footer"
                  desc="Cor de fundo do rodapé do site"
                  value={design.footerBg}
                  onChange={(v) => updateDesign("footerBg", v)}
                />
                <ColorRow
                  label="Cor das Fontes"
                  desc="Cor principal do texto em todo o site"
                  value={design.fontColor}
                  onChange={(v) => updateDesign("fontColor", v)}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-sm">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-eye-line text-emerald-600 text-sm"></i>
              </div>
              Prévia das Cores
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                style={{ backgroundColor: design.buttonColor, color: design.buttonTextColor }}
              >
                Botão Principal
              </button>
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-bold border-2 transition-colors whitespace-nowrap"
                style={{ borderColor: design.primaryColor, color: design.primaryColor, backgroundColor: "transparent" }}
              >
                Botão Secundário
              </button>
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: design.primaryLight, color: design.primaryText }}
              >
                Badge / Tag
              </span>
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: design.accentColor, color: "#fff" }}
              >
                Destaque
              </span>
              <div
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: design.navbarBg, color: design.fontColor, border: "1px solid #e5e7eb" }}
              >
                Navbar
              </div>
              <div
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: design.footerBg, color: design.fontColor, border: "1px solid #e5e7eb" }}
              >
                Footer
              </div>
            </div>
          </div>

          {/* Hero Images */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2 text-sm">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-image-line text-emerald-600 text-sm"></i>
              </div>
              Imagens das Seções Hero
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Insira a URL da imagem para cada seção hero. Use imagens com proporção 16:9 ou panorâmica (mínimo 1920×700px) para melhor resultado.
            </p>
            <div>
              <ImageUrlRow
                label="Hero — Página Inicial (/)"
                desc="Imagem de fundo da seção principal da Home"
                value={design.heroHomeUrl}
                onChange={(v) => updateDesign("heroHomeUrl", v)}
              />
              <ImageUrlRow
                label="Hero — Crie seu Currículo (/crie-seu-curriculo)"
                desc="Imagem de fundo da seção hero da página de currículo"
                value={design.heroCurriculoUrl}
                onChange={(v) => updateDesign("heroCurriculoUrl", v)}
              />
              <ImageUrlRow
                label="Hero — Para Empresas (/para-empresas)"
                desc="Imagem de fundo da seção hero da página para empresas"
                value={design.heroEmpresasUrl}
                onChange={(v) => updateDesign("heroEmpresasUrl", v)}
              />
            </div>
            <div className="mt-4 bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                <i className="ri-information-line text-amber-500 mt-0.5 shrink-0"></i>
                <span>
                  <strong>Dica:</strong> Para ativar as imagens personalizadas no site, conecte o Supabase e salve as configurações. As URLs serão lidas dinamicamente pelas páginas. Enquanto isso, as imagens padrão continuam sendo usadas.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-save-line text-sm"></i>
          </div>
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
