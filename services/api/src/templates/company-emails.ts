/**
 * Templates HTML de e-mails para empresas — usando layout padrão VagasOeste.
 * Paleta #065f46. Layout idêntico aos templates Supabase oficiais.
 */

import { buildEmailLayout, bodyParagraph, brandText } from './_layout.js';

interface ActivationArgs {
  contactName:  string;
  companyName:  string;
  cnpj:         string;
  activationUrl: string;
  /** Validade do token em horas (default: 48) */
  validityHours?: number;
}

interface ApprovedArgs {
  contactName:       string;
  companyName:       string;
  cnpj:              string;
  promotedJobsCount: number;
  loginUrl:          string;
}

interface RejectedArgs {
  contactName:        string;
  companyName:        string;
  cnpj:               string;
  motivo:             string;
  contactSupportUrl:  string;
}

// ────────────────────────────────────────────────────────────────────────────
// Ativação inicial do pré-cadastro de empresa
// (substitui o template "Invite user" default em inglês do Supabase)
// ────────────────────────────────────────────────────────────────────────────
export function buildCompanyActivationEmail(args: ActivationArgs): { subject: string; html: string } {
  const { contactName, companyName, cnpj, activationUrl, validityHours = 48 } = args;
  const subject = `Ative seu pré-cadastro — ${companyName} | VagasOeste`;
  const title   = 'Ative seu pré-cadastro';

  const bodyHtml = [
    bodyParagraph(`Olá, ${brandText(contactName)}!`),
    bodyParagraph(
      `Recebemos o pré-cadastro da empresa ${brandText(companyName)} (CNPJ ${cnpj}) na VagasOeste.`,
    ),
    bodyParagraph(
      `Para concluir e ter acesso ao painel da empresa, ative seu cadastro clicando no botão abaixo. ` +
      `O link é válido por <strong>${validityHours} horas</strong>.`,
      true,
    ),
  ].join('');

  return {
    subject,
    html: buildEmailLayout({
      title,
      bodyHtml,
      cta: { label: 'Ativar pré-cadastro', href: activationUrl, emoji: '👉' },
      disclaimer:
        'Se você não solicitou este pré-cadastro, ignore este e-mail. ' +
        'Após a ativação, sua conta passará por validação da equipe VagasOeste antes de publicar vagas.',
    }),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Aprovação do pré-cadastro pela equipe (etapa 2)
// ────────────────────────────────────────────────────────────────────────────
export function buildCompanyApprovedEmail(args: ApprovedArgs): { subject: string; html: string } {
  const { contactName, companyName, cnpj, promotedJobsCount, loginUrl } = args;
  const subject = `✅ Cadastro aprovado — Bem-vindo(a) à VagasOeste!`;
  const title   = 'Cadastro aprovado';

  const siteUrl     = process.env.SITE_URL ?? 'https://santarem.app';
  const siteDisplay = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const siteLink    = `<a href="${siteUrl}" style="color:#065f46;text-decoration:none;font-weight:600;">${siteDisplay}</a>`;

  const jobsLine = promotedJobsCount > 0
    ? `<strong>${promotedJobsCount} vaga${promotedJobsCount > 1 ? 's' : ''}</strong> que você cadastrou ${promotedJobsCount > 1 ? 'foram publicadas' : 'foi publicada'} automaticamente em ${siteLink}.`
    : `A partir de agora, qualquer vaga que você cadastrar fica imediatamente visível pra candidatos em ${siteLink}.`;

  const bodyHtml = [
    bodyParagraph(`Olá, ${brandText(contactName)}!`),
    bodyParagraph(
      `Ótima notícia! O cadastro da empresa ${brandText(companyName)} (CNPJ ${cnpj}) foi <strong>aprovado</strong> pela equipe VagasOeste.`,
    ),
    bodyParagraph(jobsLine),
    bodyParagraph(
      `Você pode acessar o painel da empresa para gerenciar suas vagas e acompanhar candidaturas.`,
      true,
    ),
  ].join('');

  return {
    subject,
    html: buildEmailLayout({
      title,
      bodyHtml,
      cta: { label: 'Acessar painel da empresa', href: loginUrl, emoji: '👉' },
      disclaimer:
        'O nome da empresa permanece anônimo aos candidatos até a fase final do processo seletivo, ' +
        'garantindo um processo justo e seguro.',
    }),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Rejeição do pré-cadastro pela equipe
// ────────────────────────────────────────────────────────────────────────────
export function buildCompanyRejectedEmail(args: RejectedArgs): { subject: string; html: string } {
  const { contactName, companyName, cnpj, motivo, contactSupportUrl } = args;
  const subject = `Atualização sobre seu pré-cadastro — VagasOeste`;
  const title   = 'Atualização do seu pré-cadastro';

  const motivoBlock = `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 28px 0;">
    <tr>
      <td style="background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;">
        <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#92400e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Motivo informado pela equipe:</p>
        <p style="margin:0;font-size:14px;color:#78350f;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${motivo}</p>
      </td>
    </tr>
  </table>`;

  const bodyHtml = [
    bodyParagraph(`Olá, ${brandText(contactName)}.`),
    bodyParagraph(
      `Recebemos seu pré-cadastro da empresa ${brandText(companyName)} (CNPJ ${cnpj}) e, após análise, ele <strong>não foi aprovado</strong> neste momento.`,
    ),
    motivoBlock,
    bodyParagraph(
      `Se você acredita que houve um equívoco ou tem informações adicionais que possam reverter essa decisão, entre em contato com a nossa equipe.`,
      true,
    ),
  ].join('');

  return {
    subject,
    html: buildEmailLayout({
      title,
      bodyHtml,
      cta: { label: 'Falar com o suporte', href: contactSupportUrl },
      disclaimer: 'Agradecemos seu interesse em fazer parte da VagasOeste.',
    }),
  };
}
