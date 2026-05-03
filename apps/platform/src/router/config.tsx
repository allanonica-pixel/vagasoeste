import type { RouteObject } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import VagasPage from "../pages/vagas/page";
import VagaDetalhePage from "../pages/vaga-detalhe/page";
import CadastroPage from "../pages/cadastro/page";
import VerificarEmailPage from "../pages/verificar-email/page";
import PlataformaPage from "../pages/plataforma/page";
import CandidatoPerfilPage from "../pages/plataforma/components/CandidatoPerfilPage";
import EmpresaPage from "../pages/empresa/page";
import DicasDeVagaPage from "../pages/dicas-de-vaga/page";
import CrieSeuCurriculoPage from "../pages/crie-seu-curriculo/page";
import CurriculoAvulsoPage from "../pages/curriculo-avulso/page";
import LoginPage from "../pages/login/page";
import AdminPage from "../pages/admin/page";
import AcessoRestritoPage from "../pages/acesso-restrito/page";
import ComoFuncionaPage from "../pages/como-funciona/page";
import ParaEmpresasPage from "../pages/para-empresas/page";
import InteresseEmpresaPage from "../pages/interesse-empresa/page";
import BlogPage from "../pages/blog/page";
import BlogPostPage from "../pages/blog/post";
import EsqueciSenhaPage from "../pages/esqueci-senha/page";
import RedefinirSenhaPage from "../pages/redefinir-senha/page";
import ConfirmacaoEmailPage from "../pages/confirmacao-email/page";

const routes: RouteObject[] = [
  // ── Públicas ────────────────────────────────────────────────
  { path: "/", element: <Home /> },
  { path: "/vagas", element: <VagasPage /> },
  { path: "/vagas/:id", element: <VagaDetalhePage /> },
  { path: "/cadastro", element: <CadastroPage /> },
  { path: "/verificar-email", element: <VerificarEmailPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/dicas-de-vaga", element: <DicasDeVagaPage /> },
  { path: "/crie-seu-curriculo", element: <CrieSeuCurriculoPage /> },
  { path: "/curriculo-avulso", element: <CurriculoAvulsoPage /> },
  { path: "/como-funciona", element: <ComoFuncionaPage /> },
  { path: "/para-empresas", element: <ParaEmpresasPage /> },
  { path: "/interesse-empresa", element: <InteresseEmpresaPage /> },
  { path: "/blog", element: <BlogPage /> },
  { path: "/blog/:slug", element: <BlogPostPage /> },
  { path: "/esqueci-senha", element: <EsqueciSenhaPage /> },
  { path: "/redefinir-senha", element: <RedefinirSenhaPage /> },
  { path: "/confirmacao-email", element: <ConfirmacaoEmailPage /> },

  // ── Candidato ───────────────────────────────────────────────
  {
    path: "/plataforma",
    element: (
      <PrivateRoute allowedRoles={["candidato"]}>
        <PlataformaPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/plataforma/perfil",
    element: (
      <PrivateRoute allowedRoles={["candidato"]}>
        <CandidatoPerfilPage />
      </PrivateRoute>
    ),
  },

  // ── Empresa ─────────────────────────────────────────────────
  {
    path: "/empresa/dashboard",
    element: (
      <PrivateRoute allowedRoles={["empresa"]} requireMfa>
        <EmpresaPage />
      </PrivateRoute>
    ),
  },

  // ── Admin ───────────────────────────────────────────────────
  {
    // /admin → 404. Painel real está na rota secreta abaixo.
    path: "/admin",
    element: <NotFound />,
  },
  {
    // URL de login admin — não linkada em nenhum lugar do sistema
    path: "/acesso-restrito",
    element: <AcessoRestritoPage />,
  },
  {
    // Painel admin real — só acessível após login em /acesso-restrito
    path: "/vo-painel",
    element: (
      <PrivateRoute allowedRoles={["admin"]} redirectTo="/acesso-restrito" requireMfa>
        <AdminPage />
      </PrivateRoute>
    ),
  },

  // ── Catch-all ───────────────────────────────────────────────
  { path: "*", element: <NotFound /> },
];

export default routes;
