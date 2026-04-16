import type { RouteObject } from "react-router-dom";
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
import ComoFuncionaPage from "../pages/como-funciona/page";
import ParaEmpresasPage from "../pages/para-empresas/page";
import PreCadastroPage from "../pages/pre-cadastro/page";
import InteresseEmpresaPage from "../pages/interesse-empresa/page";
import BlogPage from "../pages/blog/page";
import BlogPostPage from "../pages/blog/post";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/vagas",
    element: <VagasPage />,
  },
  {
    path: "/vagas/:id",
    element: <VagaDetalhePage />,
  },
  {
    path: "/cadastro",
    element: <CadastroPage />,
  },
  {
    path: "/verificar-email",
    element: <VerificarEmailPage />,
  },
  {
    path: "/plataforma",
    element: <PlataformaPage />,
  },
  {
    path: "/plataforma/perfil",
    element: <CandidatoPerfilPage />,
  },
  {
    path: "/empresa/dashboard",
    element: <EmpresaPage />,
  },
  {
    path: "/dicas-de-vaga",
    element: <DicasDeVagaPage />,
  },
  {
    path: "/crie-seu-curriculo",
    element: <CrieSeuCurriculoPage />,
  },
  {
    path: "/curriculo-avulso",
    element: <CurriculoAvulsoPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/como-funciona",
    element: <ComoFuncionaPage />,
  },
  {
    path: "/para-empresas",
    element: <ParaEmpresasPage />,
  },
  {
    path: "/pre-cadastro",
    element: <PreCadastroPage />,
  },
  {
    path: "/interesse-empresa",
    element: <InteresseEmpresaPage />,
  },
  {
    path: "/blog",
    element: <BlogPage />,
  },
  {
    path: "/blog/:slug",
    element: <BlogPostPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
