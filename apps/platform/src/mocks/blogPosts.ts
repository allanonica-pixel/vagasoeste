export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  authorImage: string;
  coverImage: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  featured: boolean;
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "como-se-destacar-em-entrevistas-de-emprego",
    title: "Como se Destacar em Entrevistas de Emprego em Santarém",
    excerpt: "Descubra as estratégias mais eficazes para impressionar recrutadores e conquistar a vaga dos seus sonhos no mercado de trabalho do oeste do Pará.",
    content: `
## Prepare-se com Antecedência

A preparação é o diferencial entre candidatos que conseguem emprego e os que ficam para trás. Antes de qualquer entrevista de emprego em Santarém, pesquise sobre a empresa, seu setor de atuação e os valores que ela preza.

### Pesquise a Empresa

Entender o negócio da empresa demonstra interesse genuíno e profissionalismo. Saiba:
- Qual o principal produto ou serviço oferecido
- Há quanto tempo a empresa atua no mercado
- Quais são os valores e a missão da organização

### Prepare Respostas para Perguntas Comuns

As perguntas mais frequentes em entrevistas de emprego incluem:
- "Fale sobre você" — prepare um resumo profissional de 2 minutos
- "Quais são seus pontos fortes e fracos?" — seja honesto e mostre autoconhecimento
- "Por que você quer trabalhar aqui?" — conecte seus objetivos aos da empresa

## Apresentação Pessoal

A primeira impressão conta muito. Vista-se de forma adequada ao cargo pretendido, chegue com 10 minutos de antecedência e mantenha uma postura confiante.

### Linguagem Corporal

- Mantenha contato visual sem ser invasivo
- Sorria naturalmente
- Sente-se ereto, demonstrando atenção
- Evite cruzar os braços

## Após a Entrevista

Envie um email de agradecimento em até 24 horas. Isso demonstra profissionalismo e mantém seu nome na memória do recrutador.

A VagasOeste intermediará todo o processo de seleção, garantindo que seu perfil chegue às empresas certas de forma anônima e segura.
    `,
    category: "Entrevistas",
    author: "Equipe VagasOeste",
    authorRole: "Consultores de RH",
    authorImage: "https://readdy.ai/api/search-image?query=professional%20HR%20consultant%20team%20smiling%20office%20environment%20clean%20background%20warm%20light%20corporate&width=200&height=200&seq=ba1&orientation=squarish",
    coverImage: "https://readdy.ai/api/search-image?query=professional%20job%20interview%20two%20people%20talking%20across%20desk%20office%20environment%20clean%20modern%20Santarem%20Para%20Brazil%20warm%20natural%20light%20confident%20handshake&width=800&height=450&seq=bc1&orientation=landscape",
    publishedAt: "2026-04-10",
    readTime: 5,
    tags: ["Entrevista", "Dicas", "Emprego", "Santarém"],
    featured: true,
  },
  {
    id: "2",
    slug: "curriculo-perfeito-para-o-mercado-de-santarem",
    title: "Como Criar um Currículo Perfeito para o Mercado de Santarém",
    excerpt: "Aprenda a montar um currículo objetivo, profissional e que chame atenção dos recrutadores locais. Dicas práticas para candidatos de todos os níveis.",
    content: `
## O Currículo é Seu Cartão de Visitas

No mercado de trabalho de Santarém e região oeste do Pará, um currículo bem estruturado pode ser a diferença entre ser chamado para uma entrevista ou não. Veja como criar o seu.

### Estrutura Básica do Currículo

1. **Dados de Contato** — Nome, telefone/WhatsApp, email e bairro (não precisa colocar endereço completo)
2. **Objetivo Profissional** — 2 a 3 linhas descrevendo o cargo desejado e suas principais qualidades
3. **Formação Acadêmica** — Do mais recente para o mais antigo
4. **Experiências Profissionais** — Empresa, cargo, período e principais atividades
5. **Cursos e Certificações** — Cursos relevantes para a vaga
6. **Habilidades** — Competências técnicas e comportamentais

### Dicas de Ouro

- **Seja objetivo:** Máximo 2 páginas
- **Use verbos de ação:** "Gerenciei", "Desenvolvi", "Implementei"
- **Adapte para cada vaga:** Destaque as experiências mais relevantes
- **Revise ortografia:** Erros de português comprometem sua imagem

### O que Evitar

- Foto desnecessária (a menos que solicitada)
- Informações pessoais como CPF, RG, estado civil
- Experiências irrelevantes de mais de 10 anos atrás
- Objetivos genéricos como "Trabalhar em empresa de renome"

## Use a Plataforma VagasOeste

Com o construtor de currículo da VagasOeste, você cria um currículo profissional em minutos, com prévia em tempo real e download em PDF de alta qualidade.
    `,
    category: "Currículo",
    author: "Equipe VagasOeste",
    authorRole: "Consultores de RH",
    authorImage: "https://readdy.ai/api/search-image?query=professional%20HR%20consultant%20team%20smiling%20office%20environment%20clean%20background%20warm%20light%20corporate&width=200&height=200&seq=ba2&orientation=squarish",
    coverImage: "https://readdy.ai/api/search-image?query=resume%20curriculum%20vitae%20document%20professional%20desk%20pen%20notebook%20clean%20minimal%20office%20background%20warm%20light%20writing%20career&width=800&height=450&seq=bc2&orientation=landscape",
    publishedAt: "2026-04-08",
    readTime: 6,
    tags: ["Currículo", "Dicas", "Emprego", "Mercado de Trabalho"],
    featured: true,
  },
  {
    id: "3",
    slug: "mercado-de-trabalho-em-santarem-2026",
    title: "Mercado de Trabalho em Santarém em 2026: Setores em Alta",
    excerpt: "Análise completa dos setores que mais contratam em Santarém e região. Saiba onde estão as melhores oportunidades de emprego no oeste do Pará.",
    content: `
## Panorama do Mercado de Trabalho em Santarém

Santarém, maior cidade do oeste do Pará, tem apresentado crescimento consistente em diversos setores econômicos. Em 2026, as oportunidades de emprego estão concentradas em áreas específicas.

### Setores que Mais Contratam

**1. Comércio e Varejo**
O setor comercial é o maior empregador de Santarém, com destaque para supermercados, lojas de roupas e materiais de construção. Cargos mais demandados: operador de caixa, vendedor, estoquista e auxiliar administrativo.

**2. Saúde**
Com a expansão dos serviços de saúde na região, há grande demanda por técnicos de enfermagem, recepcionistas, auxiliares de farmácia e agentes comunitários de saúde.

**3. Logística e Transporte**
A posição estratégica de Santarém como hub logístico do oeste paraense gera vagas constantes para motoristas, operadores de empilhadeira e auxiliares de logística.

**4. Construção Civil**
O crescimento urbano de Santarém mantém alta demanda por pedreiros, eletricistas, encanadores e auxiliares de obras.

**5. Alimentação e Gastronomia**
O setor de alimentação cresce com novos restaurantes e lanchonetes, demandando cozinheiros, garçons e auxiliares de cozinha.

### Habilidades Mais Valorizadas

- Pacote Office (Word, Excel)
- Atendimento ao cliente
- Comunicação clara e objetiva
- Trabalho em equipe
- Pontualidade e comprometimento

## Como a VagasOeste Pode Ajudar

A VagasOeste conecta candidatos de Santarém e região às melhores oportunidades de emprego, com processo seletivo transparente e intermediado por profissionais de RH.
    `,
    category: "Mercado de Trabalho",
    author: "Equipe VagasOeste",
    authorRole: "Analistas de Mercado",
    authorImage: "https://readdy.ai/api/search-image?query=professional%20market%20analyst%20team%20smiling%20office%20environment%20clean%20background%20warm%20light%20corporate&width=200&height=200&seq=ba3&orientation=squarish",
    coverImage: "https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20city%20aerial%20view%20Amazon%20river%20urban%20growth%20commercial%20district%20modern%20buildings%20tropical%20warm%20light%202026&width=800&height=450&seq=bc3&orientation=landscape",
    publishedAt: "2026-04-05",
    readTime: 7,
    tags: ["Mercado de Trabalho", "Santarém", "Setores", "Oportunidades"],
    featured: false,
  },
  {
    id: "4",
    slug: "como-usar-o-linkedin-para-encontrar-emprego",
    title: "Como Usar o LinkedIn para Encontrar Emprego em Santarém",
    excerpt: "O LinkedIn é uma ferramenta poderosa para quem busca emprego. Aprenda a criar um perfil atrativo e usar a rede para se destacar no mercado local.",
    content: `
## LinkedIn: A Rede Profissional Mais Importante do Mundo

Mesmo em cidades como Santarém, o LinkedIn se tornou uma ferramenta essencial para quem busca emprego. Veja como usar a plataforma a seu favor.

### Criando um Perfil Atrativo

**Foto profissional:** Use uma foto com boa iluminação, fundo neutro e expressão confiante. Evite selfies ou fotos de festas.

**Título profissional:** Seja específico. Em vez de "Procurando emprego", use "Auxiliar Administrativo | Pacote Office | Santarém-PA".

**Resumo:** Escreva 3 a 5 linhas sobre sua trajetória, habilidades e objetivos profissionais.

### Construindo sua Rede

- Conecte-se com ex-colegas de trabalho e estudo
- Siga empresas de Santarém que te interessam
- Participe de grupos de profissionais do Pará
- Interaja com conteúdos relevantes da sua área

### Usando o LinkedIn para Buscar Vagas

1. Use filtros de localização: "Santarém, Pará"
2. Configure alertas de vagas para receber notificações
3. Candidate-se diretamente pela plataforma
4. Personalize a mensagem de candidatura

## Combine com a VagasOeste

Use o LinkedIn para networking e visibilidade, e a VagasOeste para candidaturas locais com processo seletivo intermediado e seguro.
    `,
    category: "Dicas Profissionais",
    author: "Equipe VagasOeste",
    authorRole: "Especialistas em Carreira",
    authorImage: "https://readdy.ai/api/search-image?query=professional%20career%20specialist%20team%20smiling%20office%20environment%20clean%20background%20warm%20light%20corporate&width=200&height=200&seq=ba4&orientation=squarish",
    coverImage: "https://readdy.ai/api/search-image?query=LinkedIn%20professional%20networking%20laptop%20smartphone%20social%20media%20career%20job%20search%20modern%20office%20clean%20minimal%20background%20warm%20light&width=800&height=450&seq=bc4&orientation=landscape",
    publishedAt: "2026-04-02",
    readTime: 5,
    tags: ["LinkedIn", "Networking", "Dicas", "Carreira"],
    featured: false,
  },
  {
    id: "5",
    slug: "direitos-trabalhistas-que-todo-candidato-deve-conhecer",
    title: "Direitos Trabalhistas que Todo Candidato Deve Conhecer",
    excerpt: "Conheça seus direitos antes de assinar qualquer contrato de trabalho. Informação é poder na hora de negociar e garantir condições justas de emprego.",
    content: `
## Conheça Seus Direitos Antes de Assinar

Antes de aceitar qualquer proposta de emprego, é fundamental conhecer seus direitos trabalhistas. Isso evita surpresas desagradáveis e garante condições justas de trabalho.

### Direitos Básicos do Trabalhador CLT

**Salário Mínimo:** Em 2026, o salário mínimo nacional é de R$ 1.518,00. Nenhum empregador pode pagar menos que isso.

**13º Salário:** Pago em duas parcelas: até 30 de novembro e até 20 de dezembro.

**Férias:** 30 dias de férias remuneradas após 12 meses de trabalho, com adicional de 1/3 do salário.

**FGTS:** O empregador deve depositar 8% do salário mensalmente no Fundo de Garantia.

**Vale-Transporte:** Obrigatório para deslocamento casa-trabalho, com desconto máximo de 6% do salário.

### Contrato de Trabalho

Sempre exija o contrato de trabalho assinado antes de começar. O contrato deve especificar:
- Cargo e função
- Salário e benefícios
- Jornada de trabalho
- Data de início

### Período de Experiência

O contrato de experiência pode durar até 90 dias, prorrogável uma vez. Durante esse período, você tem todos os direitos trabalhistas normais.

## A VagasOeste Garante Transparência

Todos os processos seletivos intermediados pela VagasOeste são conduzidos com total transparência, garantindo que candidatos e empresas conheçam e respeitem seus direitos e deveres.
    `,
    category: "Direitos Trabalhistas",
    author: "Equipe VagasOeste",
    authorRole: "Consultores Jurídicos",
    authorImage: "https://readdy.ai/api/search-image?query=professional%20legal%20consultant%20team%20smiling%20office%20environment%20clean%20background%20warm%20light%20corporate&width=200&height=200&seq=ba5&orientation=squarish",
    coverImage: "https://readdy.ai/api/search-image?query=labor%20rights%20law%20book%20contract%20signing%20professional%20desk%20pen%20documents%20clean%20minimal%20office%20background%20warm%20light%20Brazil&width=800&height=450&seq=bc5&orientation=landscape",
    publishedAt: "2026-03-28",
    readTime: 8,
    tags: ["Direitos Trabalhistas", "CLT", "Contrato", "Salário"],
    featured: false,
  },
  {
    id: "6",
    slug: "como-negociar-salario-com-confianca",
    title: "Como Negociar Salário com Confiança e Conseguir o que Você Merece",
    excerpt: "A negociação salarial é uma habilidade que pode ser aprendida. Veja como se preparar, o que falar e como conseguir a melhor remuneração possível.",
    content: `
## Negociar Salário é um Direito, Não um Problema

Muitos candidatos evitam negociar salário por medo de perder a vaga. Mas a verdade é que a maioria dos recrutadores espera e respeita quem negocia com profissionalismo.

### Pesquise Antes de Negociar

Antes de qualquer negociação, pesquise:
- Média salarial para o cargo em Santarém
- Faixa salarial da empresa (se disponível)
- Seu nível de experiência comparado ao mercado

### Como Apresentar sua Pretensão

Quando perguntado sobre pretensão salarial:
1. Dê uma faixa, não um valor fixo: "Entre R$ 2.000 e R$ 2.500"
2. Justifique com sua experiência e habilidades
3. Mostre que você pesquisou o mercado

### Argumentos para Negociar

- Experiência comprovada na área
- Cursos e certificações relevantes
- Resultados alcançados em empregos anteriores
- Habilidades específicas que a empresa precisa

### O que Fazer se a Oferta for Baixa

Se a oferta estiver abaixo do esperado:
- Agradeça e peça um tempo para pensar
- Pergunte sobre possibilidade de revisão após período de experiência
- Considere os benefícios além do salário (plano de saúde, vale-alimentação, etc.)

## Transparência no Processo VagasOeste

Na VagasOeste, a pretensão salarial do candidato é informada às empresas de forma anônima, garantindo que a negociação seja justa e baseada em competências.
    `,
    category: "Carreira",
    author: "Equipe VagasOeste",
    authorRole: "Especialistas em Carreira",
    authorImage: "https://readdy.ai/api/search-image?query=professional%20career%20coach%20team%20smiling%20office%20environment%20clean%20background%20warm%20light%20corporate&width=200&height=200&seq=ba6&orientation=squarish",
    coverImage: "https://readdy.ai/api/search-image?query=salary%20negotiation%20professional%20meeting%20handshake%20office%20desk%20confident%20business%20people%20clean%20modern%20background%20warm%20light%20career%20success&width=800&height=450&seq=bc6&orientation=landscape",
    publishedAt: "2026-03-20",
    readTime: 6,
    tags: ["Salário", "Negociação", "Carreira", "Dicas"],
    featured: false,
  },
];

export const blogCategories = [
  "Todos",
  "Entrevistas",
  "Currículo",
  "Mercado de Trabalho",
  "Dicas Profissionais",
  "Direitos Trabalhistas",
  "Carreira",
];
