import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { formatBrazilPhone, isValidBrazilPhone } from "@/hooks/useBrazilPhone";

const SECTORS = [
  "Comércio", "Saúde", "Tecnologia", "Logística", "Alimentação",
  "Indústria", "Serviços", "Construção Civil", "Educação", "Financeiro",
  "Agronegócio", "Outro",
];

const COMPANY_SIZES = [
  "Microempresa (até 9 funcionários)",
  "Pequena empresa (10–49 funcionários)",
  "Média empresa (50–249 funcionários)",
  "Grande empresa (250+ funcionários)",
];

const HIRING_NEEDS = [
  "1–2 vagas",
  "3–5 vagas",
  "6–10 vagas",
  "Mais de 10 vagas",
];

type FormStatus = "idle" | "submitting" | "success" | "error";

interface FormData {
  nomeEmpresa: string;
  setor: string;
  porte: string;
  responsavel: string;
  cargo: string;
  email: string;
  whatsapp: string;
  vagas: string;
  mensagem: string;
  comoConheceu: string;
}

const INITIAL: FormData = {
  nomeEmpresa: "",
  setor: "",
  porte: "",
  responsavel: "",
  cargo: "",
  email: "",
  whatsapp: "",
  vagas: "",
  mensagem: "",
  comoConheceu: "",
};

export default function InteresseEmpresaPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.nomeEmpresa.trim()) e.nomeEmpresa = "Campo obrigatório";
    if (!form.setor) e.setor = "Selecione um setor";
    if (!form.porte) e.porte = "Selecione o porte";
    if (!form.responsavel.trim()) e.responsavel = "Campo obrigatório";
    if (!form.cargo.trim()) e.cargo = "Campo obrigatório";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.whatsapp.trim()) {
      e.whatsapp = "Campo obrigatório";
    } else if (!isValidBrazilPhone(form.whatsapp)) {
      e.whatsapp = "Número inválido";
    }
    if (!form.vagas) e.vagas = "Selecione uma opção";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");

    const body = new URLSearchParams();
    body.append("nomeEmpresa", form.nomeEmpresa);
    body.append("setor", form.setor);
    body.append("porte", form.porte);
    body.append("responsavel", form.responsavel);
    body.append("cargo", form.cargo);
    body.append("email", form.email);
    body.append("whatsapp", form.whatsapp);
    body.append("vagas", form.vagas);
    body.append("mensagem", form.mensagem);
    body.append("comoConheceu", form.comoConheceu);

    try {
      const res = await fetch("https://readdy.ai/api/form/d7gkibigm6d735ptot10", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-32 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <i className="ri-checkbox-circle-fill text-emerald-600 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Interesse recebido!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            Obrigado pelo interesse, <strong className="text-gray-700">{form.nomeEmpresa}</strong>!
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Nossa equipe entrará em contato em até <strong className="text-gray-700">24 horas úteis</strong> pelo WhatsApp ou email informado.
          </p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-8 text-left">
            <p className="text-emerald-800 text-sm font-semibold mb-3 flex items-center gap-2">
              <i className="ri-time-line text-emerald-600"></i>
              O que acontece agora?
            </p>
            <ul className="space-y-2">
              {[
                "Nossa equipe analisa seu interesse",
                "Entramos em contato para apresentar a plataforma",
                "Realizamos o cadastro completo da sua empresa",
                "Você começa a publicar vagas e receber candidatos",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-emerald-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/para-empresas")}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap"
            >
              Voltar para Para Empresas
            </button>
            <Link
              to="/"
              className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-center"
            >
              Ir para a Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div
        className="relative pt-16 overflow-hidden"
        style={{
          backgroundImage: `url(https://readdy.ai/api/search-image?query=professional%20business%20meeting%20handshake%20partnership%20agreement%20modern%20office%20bright%20natural%20light%20warm%20tones%20corporate%20success%20team%20collaboration&width=1440&height=500&seq=ie-hero-1&orientation=landscape)`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/85 via-emerald-900/70 to-emerald-900/40"></div>
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 pt-24 pb-14">
          <div className="flex items-center gap-2 text-emerald-300 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors cursor-pointer">Início</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/para-empresas" className="hover:text-white transition-colors cursor-pointer">Para Empresas</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">Falar com a Equipe</span>
          </div>
          <div className="max-w-2xl">
            <span className="inline-block bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Contato Comercial
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Fale com nossa equipe e comece a contratar
            </h1>
            <p className="text-emerald-100 text-base leading-relaxed">
              Preencha o formulário abaixo e nossa equipe entrará em contato em até <strong>24 horas úteis</strong> para apresentar a plataforma e iniciar seu cadastro.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {[
              { icon: "ri-time-line", text: "Resposta em até 24h úteis" },
              { icon: "ri-shield-check-line", text: "Processo 100% seguro" },
              { icon: "ri-customer-service-line", text: "Suporte dedicado" },
              { icon: "ri-user-heart-line", text: "Candidatos qualificados" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${b.icon} text-emerald-600 text-sm`}></i>
                </div>
                <span className="text-gray-600 text-xs font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form */}
          <div className="lg:col-span-2">
            <form
              id="interesse-empresa-form"
              data-readdy-form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Dados da Empresa */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <i className="ri-building-line text-emerald-600 text-sm"></i>
                  </div>
                  Dados da Empresa
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome da empresa */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Nome da Empresa <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="nomeEmpresa"
                      value={form.nomeEmpresa}
                      onChange={(e) => update("nomeEmpresa", e.target.value)}
                      placeholder="Nome fantasia ou razão social"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.nomeEmpresa ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    />
                    {errors.nomeEmpresa && <p className="text-red-500 text-xs mt-1">{errors.nomeEmpresa}</p>}
                  </div>

                  {/* Setor */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Setor de Atuação <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="setor"
                      value={form.setor}
                      onChange={(e) => update("setor", e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors cursor-pointer ${errors.setor ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    >
                      <option value="">Selecione...</option>
                      {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.setor && <p className="text-red-500 text-xs mt-1">{errors.setor}</p>}
                  </div>

                  {/* Porte */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Porte da Empresa <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="porte"
                      value={form.porte}
                      onChange={(e) => update("porte", e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors cursor-pointer ${errors.porte ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    >
                      <option value="">Selecione...</option>
                      {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.porte && <p className="text-red-500 text-xs mt-1">{errors.porte}</p>}
                  </div>

                  {/* Vagas */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Quantas vagas pretende publicar? <span className="text-red-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HIRING_NEEDS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => update("vagas", opt)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border whitespace-nowrap ${
                            form.vagas === opt
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {errors.vagas && <p className="text-red-500 text-xs mt-1">{errors.vagas}</p>}
                  </div>
                </div>
              </div>

              {/* Responsável */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <i className="ri-user-line text-emerald-600 text-sm"></i>
                  </div>
                  Responsável pelo Contato
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Nome Completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="responsavel"
                      value={form.responsavel}
                      onChange={(e) => update("responsavel", e.target.value)}
                      placeholder="Seu nome completo"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.responsavel ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    />
                    {errors.responsavel && <p className="text-red-500 text-xs mt-1">{errors.responsavel}</p>}
                  </div>

                  {/* Cargo */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Cargo / Função <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="cargo"
                      value={form.cargo}
                      onChange={(e) => update("cargo", e.target.value)}
                      placeholder="Ex: Proprietário, Gerente de RH"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.cargo ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    />
                    {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="email@empresa.com.br"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.email ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* WhatsApp */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                        <i className="ri-whatsapp-line text-gray-400 text-sm"></i>
                      </div>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={form.whatsapp}
                        onChange={(e) => update("whatsapp", formatBrazilPhone(e.target.value))}
                        placeholder="(93) 99999-9999"
                        maxLength={15}
                        className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.whatsapp ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                      />
                    </div>
                    {errors.whatsapp ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i>{errors.whatsapp}
                      </p>
                    ) : form.whatsapp && isValidBrazilPhone(form.whatsapp) ? (
                      <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                        <i className="ri-checkbox-circle-line"></i>Número válido
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Mensagem + Como conheceu */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <i className="ri-chat-3-line text-emerald-600 text-sm"></i>
                  </div>
                  Informações Adicionais
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Mensagem <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                    </label>
                    <textarea
                      name="mensagem"
                      value={form.mensagem}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) update("mensagem", e.target.value);
                      }}
                      placeholder="Conte um pouco sobre sua empresa, o tipo de vaga que precisa preencher ou qualquer dúvida que tenha..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{form.mensagem.length}/500</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Como nos conheceu? <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                    </label>
                    <select
                      name="comoConheceu"
                      value={form.comoConheceu}
                      onChange={(e) => update("comoConheceu", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors cursor-pointer"
                    >
                      <option value="">Selecione...</option>
                      <option value="Google">Google</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="WhatsApp">Indicação pelo WhatsApp</option>
                      <option value="Indicação">Indicação de outra empresa</option>
                      <option value="Outdoor/Panfleto">Outdoor / Panfleto</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Privacy notice */}
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
                <i className="ri-shield-check-line text-emerald-500 mr-1"></i>
                Seus dados são utilizados exclusivamente para entrar em contato sobre a plataforma VagasOeste. Não compartilhamos suas informações com terceiros.
              </div>

              {/* Submit */}
              {status === "error" && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <i className="ri-error-warning-line text-red-500 text-sm"></i>
                  </div>
                  <p className="text-red-700 text-sm">Ocorreu um erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {status === "submitting" ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base"></i>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line text-base"></i>
                    Enviar interesse e aguardar contato
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Prefere falar diretamente?</h3>
              <a
                href="https://wa.me/5593999999999"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 cursor-pointer hover:bg-emerald-100 transition-colors mb-3"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <i className="ri-whatsapp-line text-white text-lg"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">WhatsApp</p>
                  <p className="text-gray-500 text-xs">(93) 99999-9999</p>
                </div>
                <div className="ml-auto w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-line text-emerald-600 text-sm"></i>
                </div>
              </a>
              <a
                href="mailto:contato@vagasoeste.com.br"
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <i className="ri-mail-line text-gray-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Email</p>
                  <p className="text-gray-500 text-xs">contato@vagasoeste.com.br</p>
                </div>
                <div className="ml-auto w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-line text-gray-400 text-sm"></i>
                </div>
              </a>
            </div>

            {/* Why VagasOeste */}
            <div className="bg-emerald-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-4 text-sm">Por que escolher a VagasOeste?</h3>
              <ul className="space-y-3">
                {[
                  { icon: "ri-eye-off-line", text: "Candidatos protegidos — empresa anônima para o público" },
                  { icon: "ri-user-search-line", text: "Pré-entrevistas realizadas pela nossa equipe" },
                  { icon: "ri-shield-user-line", text: "Dados pessoais dos candidatos nunca expostos" },
                  { icon: "ri-bar-chart-line", text: "Painel completo de gestão de candidaturas" },
                  { icon: "ri-customer-service-line", text: "Suporte humano em cada etapa" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      <i className={`${item.icon} text-emerald-200 text-sm`}></i>
                    </div>
                    <span className="text-emerald-100 text-xs leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Números da plataforma</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "200+", label: "Candidatos" },
                  { value: "30+", label: "Empresas" },
                  { value: "50+", label: "Vagas ativas" },
                  { value: "48h", label: "Tempo de resposta" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-emerald-600">{s.value}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-cadastro CTA */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <p className="text-gray-700 text-sm font-semibold mb-2">Já decidiu? Faça o pré-cadastro completo</p>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                Se já tem CNPJ e quer cadastrar vagas imediatamente, use o pré-cadastro completo.
              </p>
              <Link
                to="/pre-cadastro"
                className="flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-xl text-sm cursor-pointer hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                <i className="ri-add-circle-line text-sm"></i>
                Ir para o Pré-Cadastro
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
