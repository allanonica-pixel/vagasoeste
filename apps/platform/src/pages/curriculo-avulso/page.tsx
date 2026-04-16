import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import CurriculoEditor from "./components/CurriculoEditor";

type Mode = "choose" | "editor";

export default function CurriculoAvulsoPage() {
  const [mode, setMode] = useState<Mode>("choose");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {mode === "choose" ? (
        <ChooseMode onStart={() => setMode("editor")} />
      ) : (
        <EditorMode />
      )}

      <Footer />
    </div>
  );
}

function ChooseMode({ onStart }: { onStart: () => void }) {
  const totalJobs = 1240;

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <i className="ri-file-user-line text-sm"></i>
          Criador de Currículo Profissional
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Como você quer criar<br />seu currículo?
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Escolha a opção que melhor se encaixa no que você precisa agora.
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Option 1: Avulso */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-300 p-6 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <i className="ri-file-text-line text-gray-500 text-xl"></i>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Currículo Avulso</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Crie seu currículo sem precisar se cadastrar. Preencha, visualize e baixe o PDF gratuitamente.
          </p>
          <div className="space-y-2 mb-5">
            {[
              "Sem necessidade de cadastro",
              "Preencha e visualize na hora",
              "PDF de alta qualidade",
              "100% gratuito",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-check-line text-gray-400 text-xs"></i>
                </div>
                <span className="text-gray-600 text-xs">{item}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onStart}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-edit-line text-sm"></i>
            </div>
            Criar Currículo Agora
          </button>
        </div>

        {/* Option 2: Cadastro (Recommended) */}
        <div className="bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 p-6 transition-all relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              Mais Recomendado
            </span>
          </div>
          <div className="flex items-start justify-between mb-4 mt-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <i className="ri-user-add-line text-emerald-600 text-xl"></i>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Cadastro + Currículo</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Crie sua conta gratuita, monte seu currículo e ainda se candidate a vagas. Muito mais vantajoso!
          </p>
          <div className="space-y-2 mb-5">
            {[
              "Cadastro 100% gratuito",
              "Currículo salvo na sua conta",
              `Acesso a ${totalJobs}+ vagas em Santarém`,
              "Candidatura com 1 clique",
              "Acompanhe o processo seletivo",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-check-line text-emerald-500 text-xs"></i>
                </div>
                <span className="text-gray-700 text-xs">{item}</span>
              </div>
            ))}
          </div>
          <Link
            to="/cadastro"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-user-add-line text-sm"></i>
            </div>
            Criar Cadastro e Currículo
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "ri-shield-check-line", title: "100% Seguro", desc: "Seus dados são protegidos e nunca compartilhados sem sua autorização." },
          { icon: "ri-download-line", title: "PDF Profissional", desc: "Currículo formatado profissionalmente, pronto para enviar para qualquer empresa." },
          { icon: "ri-time-line", title: "Rápido e Fácil", desc: "Preencha em menos de 10 minutos e tenha seu currículo pronto para usar." },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3 bg-emerald-50 rounded-full">
              <i className={`${item.icon} text-emerald-600 text-lg`}></i>
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
            <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-400 text-sm mt-8">
        Já tem cadastro?{" "}
        <Link to="/plataforma" className="text-emerald-600 font-semibold hover:underline cursor-pointer">
          Acessar minha conta
        </Link>
      </p>
    </div>
  );
}

function EditorMode() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/curriculo-avulso"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-sm"></i>
          </Link>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <i className="ri-file-user-line text-sm"></i>
            Editor de Currículo
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Crie seu currículo profissional</h1>
        <p className="text-gray-500 text-sm mt-1">Preencha as etapas abaixo e baixe o PDF gratuitamente ao final.</p>
      </div>

      <CurriculoEditor />
    </div>
  );
}
