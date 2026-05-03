/**
 * Templates HTML de e-mails para empresas.
 * Mantém identidade visual VagasOeste (paleta #065f46).
 *
 * Cada função recebe os dados necessários e retorna { subject, html }.
 */

interface ApprovedArgs {
  contactName: string;
  companyName: string;
  cnpj: string;
  promotedJobsCount: number;
  loginUrl: string;
}

interface RejectedArgs {
  contactName: string;
  companyName: string;
  cnpj: string;
  motivo: string;
  contactSupportUrl: string;
}

const BRAND       = '#065f46';
const BRAND_HOVER = '#047857';
const FONT_STACK  = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:${FONT_STACK};color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.05);overflow:hidden;">
          <tr>
            <td style="background:${BRAND};padding:24px 32px;text-align:center;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">VagasOeste</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#a7f3d0;">Vagas em Santarém e região oeste do Pará</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                Este é um e-mail automático da plataforma VagasOeste.<br />
                Se você não esperava receber esta mensagem, ignore-a.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCompanyApprovedEmail(args: ApprovedArgs): { subject: string; html: string } {
  const { contactName, companyName, cnpj, promotedJobsCount, loginUrl } = args;
  const subject = `✅ Cadastro aprovado — Bem-vindo(a) à VagasOeste!`;

  const siteUrl     = process.env.SITE_URL ?? 'http://localhost:4321';
  const siteDisplay = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const jobsLine = promotedJobsCount > 0
    ? `<p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.6;">
         <strong>${promotedJobsCount} vaga${promotedJobsCount > 1 ? 's' : ''}</strong> que você já cadastrou ${promotedJobsCount > 1 ? 'foram publicadas' : 'foi publicada'} automaticamente no site público <a href="${siteUrl}" style="color:${BRAND};text-decoration:none;">${siteDisplay}</a>.
       </p>`
    : `<p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.6;">
         A partir de agora, qualquer vaga que você cadastrar fica imediatamente visível pra candidatos no site público <a href="${siteUrl}" style="color:${BRAND};text-decoration:none;">${siteDisplay}</a>.
       </p>`;

  const body = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
      Olá, ${contactName}!
    </h2>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Ótima notícia! O cadastro da empresa <strong>${companyName}</strong> (CNPJ ${cnpj}) foi <strong>aprovado</strong> pela equipe VagasOeste.
    </p>
    ${jobsLine}
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Você pode acessar o painel da empresa pra gerenciar suas vagas e acompanhar candidaturas.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:${BRAND};border-radius:12px;">
          <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            Acessar painel da empresa →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
      Como já é nossa prática, o nome da empresa permanece <strong>anônimo</strong> aos candidatos até a fase final do processo seletivo, garantindo um processo justo e seguro.
    </p>
  `;

  return { subject, html: shell(subject, body) };
}

export function buildCompanyRejectedEmail(args: RejectedArgs): { subject: string; html: string } {
  const { contactName, companyName, cnpj, motivo, contactSupportUrl } = args;
  const subject = `Atualização sobre seu pré-cadastro na VagasOeste`;

  const body = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
      Olá, ${contactName}.
    </h2>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Recebemos seu pré-cadastro da empresa <strong>${companyName}</strong> (CNPJ ${cnpj}) e, após análise, ele <strong>não foi aprovado</strong> neste momento.
    </p>
    <div style="margin:0 0 24px;padding:16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#92400e;">Motivo informado pela equipe:</p>
      <p style="margin:0;font-size:14px;color:#78350f;line-height:1.6;">${motivo}</p>
    </div>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Se você acredita que houve um equívoco ou tem informações adicionais que possam reverter essa decisão, entre em contato com a nossa equipe.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px;">
      <tr>
        <td style="background:${BRAND_HOVER};border-radius:12px;">
          <a href="${contactSupportUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
            Falar com o suporte
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
      Agradecemos seu interesse em fazer parte da VagasOeste.
    </p>
  `;

  return { subject, html: shell(subject, body) };
}
