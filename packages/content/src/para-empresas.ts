/**
 * Conteúdo da página /para-empresas
 * Fonte da verdade: altere aqui para refletir em apps/site e apps/platform.
 */

export const steps = [
  { icon: 'ri-building-line',      title: 'Faça o pré-cadastro da sua empresa',    desc: 'Cadastre sua empresa gratuitamente e ative sua conta em poucos minutos.' },
  { icon: 'ri-shield-check-line',  title: 'Acesso à plataforma',                   desc: 'Sua conta é ativada automaticamente após validação das informações, garantindo um ambiente seguro e confiável para empresas e candidatos.' },
  { icon: 'ri-briefcase-4-line',   title: 'Publique suas vagas',                    desc: 'Acesse o painel, crie vagas com detalhes completos e ative com 1 clique.' },
  { icon: 'ri-group-line',         title: 'Receba candidatos',                      desc: 'Perfis profissionais validados pela plataforma chegam diretamente no seu painel. Visualize informações relevantes, sem exposição de dados pessoais.' },
  { icon: 'ri-filter-3-line',      title: 'Selecione e filtre',                     desc: 'Utilize filtros por formação, disponibilidade, pretensão salarial e outros critérios para encontrar os perfis mais alinhados à sua vaga.' },
  { icon: 'ri-rocket-line',        title: 'Avance no processo seletivo',            desc: 'Utilize recursos automatizados para aprofundar a análise e qualificação dos candidatos antes do contato direto.' },
];

export const features = [
  { icon: 'ri-shield-user-line',        title: 'Candidatos verificados',       desc: 'Perfis passam por validações automáticas antes de chegar ao seu painel.' },
  { icon: 'ri-eye-off-line',            title: 'Empresa sempre anônima',       desc: 'Candidatos não sabem quem é sua empresa. Processo mais justo, baseado em competências.' },
  { icon: 'ri-filter-line',             title: 'Filtros inteligentes',         desc: 'Utilize filtros inteligentes para encontrar os candidatos mais alinhados às suas vagas.' },
  { icon: 'ri-task-line',               title: 'Controle do Processo Seletivo', desc: 'Tenha visibilidade completa de cada etapa, com histórico organizado e acompanhamento contínuo.' },
  { icon: 'ri-notification-badge-line', title: 'Notificações em tempo real',   desc: 'Receba alertas quando novos candidatos se inscreverem nas suas vagas.' },
  { icon: 'ri-bar-chart-line',          title: 'Relatórios',                   desc: 'Acompanhe métricas e desempenho das suas vagas com relatórios completos.' },
];

export const plans = [
  {
    name: 'Básico',
    price: 'Gratuito',
    desc: 'Para empresas que estão começando',
    features: ['1 vaga ativa', 'Até 20 candidatos/mês', 'Painel básico', 'Suporte por email'],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 149/mês',
    desc: 'Para empresas em crescimento',
    features: ['Até 5 vagas ativas', 'Candidatos ilimitados', 'Filtros avançados', 'Suporte prioritário', 'Relatórios mensais'],
    cta: 'Falar com a equipe',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    desc: 'Para grandes volumes de contratação',
    features: ['Vagas ilimitadas', 'Candidatos ilimitados', 'API de integração', 'Gerente dedicado', 'SLA garantido'],
    cta: 'Falar com a equipe',
    highlight: false,
  },
];

export const testimonials = [
  { name: 'Supermercado Central',   role: 'Gerente de RH',  text: 'Contratamos 8 funcionários nos últimos 3 meses. O processo anônimo melhora muito a qualidade das candidaturas.' },
  { name: 'Clínica São Lucas',      role: 'Administrador',   text: 'A VagasOeste intermediou todo o processo. Economizamos muito tempo e encontramos profissionais qualificados.' },
  { name: 'Construtora Paraense',   role: 'Diretor',         text: 'Plataforma simples e eficiente. O filtro por bairro e disponibilidade é exatamente o que precisávamos.' },
];

export const faqItems = [
  { question: 'Como minha empresa se cadastra?',         answer: 'Sua empresa não se cadastra sozinha. Entre em contato conosco pelo formulário ou WhatsApp. Nossa equipe cria a conta e envia as credenciais. Isso garante a qualidade das empresas na plataforma.' },
  { question: 'Quantas vagas posso publicar?',           answer: 'Depende do plano escolhido. No plano básico, 1 vaga ativa. No profissional, até 5. No Enterprise, ilimitado. Fale conosco para detalhes.' },
  { question: 'Vejo os dados pessoais dos candidatos?',  answer: 'Não. Para proteger os candidatos, você vê apenas o perfil profissional: bairro, formação, experiência, pretensão salarial e disponibilidade. Nunca nome, email ou telefone.' },
  { question: 'Como funciona a pré-entrevista?',         answer: 'Quando você identifica um candidato de interesse, solicita uma pré-entrevista pelo painel. Nossa equipe entra em contato com o candidato e coordena a conversa, preservando o anonimato até a etapa final.' },
  { question: 'Posso pausar uma vaga temporariamente?',  answer: 'Sim. No painel "Minhas Vagas" você pode pausar, reativar ou encerrar qualquer vaga a qualquer momento.' },
];
