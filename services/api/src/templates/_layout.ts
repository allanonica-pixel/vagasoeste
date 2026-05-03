/**
 * Layout visual padrão dos e-mails transacionais VagasOeste.
 *
 * Replica fielmente o layout dos templates Supabase em
 * `supabase-email-templates/{confirmation,recovery}.html` para garantir
 * identidade visual consistente entre todos os e-mails do projeto.
 *
 * Paleta:
 *   - Verde principal: #065f46 (emerald-800)
 *   - Background: #f3f4f6 (gray-100)
 *   - Texto título: #111827 (gray-900)
 *   - Texto corpo: #374151 (gray-700)
 *   - Texto aviso: #9ca3af (gray-400)
 *   - Texto assinatura: #6b7280 (gray-500)
 */

const FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

interface LayoutOptions {
  /** Título principal do e-mail (h1) */
  title: string;
  /**
   * Conteúdo HTML do corpo (entre título e botão CTA).
   * Pode conter <p>, <strong>, <a>, etc. Cada parágrafo deve ter os estilos inline padrão.
   */
  bodyHtml: string;
  /**
   * Botão CTA opcional. Se omitido, e-mail não tem botão.
   */
  cta?: {
    label: string;
    href: string;
    /** Emoji opcional antes do label (ex: 👉) */
    emoji?: string;
  };
  /**
   * Aviso/disclaimer abaixo do CTA (texto pequeno cinza).
   * Default: "Se não foi você, ignore este e-mail."
   */
  disclaimer?: string;
}

/**
 * Helper pra criar parágrafos com estilo padrão do corpo do e-mail.
 * Use no `bodyHtml` quando precisar.
 */
export function bodyParagraph(html: string, isLast = false): string {
  const margin = isLast ? '0 0 28px 0' : '0 0 12px 0';
  return `<p style="margin:${margin};font-size:15px;color:#374151;line-height:1.65;font-family:${FONT_STACK};">${html}</p>`;
}

/**
 * Helper pra destacar texto verde (cor da marca).
 */
export function brandText(html: string): string {
  return `<strong style="color:#065f46;">${html}</strong>`;
}

/**
 * Constrói o HTML completo do e-mail com o layout padrão VagasOeste.
 *
 * @example
 * buildEmailLayout({
 *   title: 'Cadastro aprovado',
 *   bodyHtml: bodyParagraph('Olá, ' + brandText('João') + '!') + bodyParagraph('Tudo certo.', true),
 *   cta: { label: 'Acessar painel', href: 'https://...', emoji: '👉' },
 * });
 */
export function buildEmailLayout(opts: LayoutOptions): string {
  const { title, bodyHtml, cta, disclaimer = 'Se não foi você, ignore este e-mail.' } = opts;
  const siteUrl  = process.env.SITE_URL ?? 'https://santarem.app';

  // Display do site no rodapé — extrai apenas o domínio (sem protocolo nem path)
  const siteDisplay = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const ctaHtml = cta
    ? `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:32px;">
        <tr>
          <td align="center" style="background-color:#065f46;border-radius:10px;">
            <a href="${cta.href}" target="_blank"
              style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;font-family:${FONT_STACK};letter-spacing:0.1px;">
              ${cta.emoji ? `${cta.emoji}&nbsp;&nbsp;` : ''}${cta.label}
            </a>
          </td>
        </tr>
      </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title} — VagasOeste</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:520px;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="background-color:#065f46;border-radius:10px;padding:10px 22px;">
                    <span style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:-0.3px;font-family:${FONT_STACK};">
                      VagasOeste
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;border:1px solid #e5e7eb;">

              <!-- Faixa verde superior -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="background-color:#065f46;height:4px;font-size:1px;line-height:1px;border-radius:16px 16px 0 0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Conteúdo -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="padding:40px 40px 36px 40px;">

                    <!-- Título -->
                    <h1 style="margin:0 0 20px 0;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.3px;line-height:1.3;font-family:${FONT_STACK};">
                      ${title}
                    </h1>

                    ${bodyHtml}

                    ${ctaHtml}

                    <!-- Divisor -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
                      <tr>
                        <td style="border-top:1px solid #f3f4f6;font-size:1px;line-height:1px;">&nbsp;</td>
                      </tr>
                    </table>

                    <!-- Aviso -->
                    <p style="margin:0 0 20px 0;font-size:13px;color:#9ca3af;line-height:1.6;font-family:${FONT_STACK};">
                      ${disclaimer}
                    </p>

                    <!-- Assinatura -->
                    <p style="margin:0;font-size:14px;color:#6b7280;font-family:${FONT_STACK};">
                      Equipe <strong style="color:#065f46;">VagasOeste</strong>
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- RODAPÉ -->
          <tr>
            <td align="center" style="padding:24px 0 0 0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.8;font-family:${FONT_STACK};">
                © ${new Date().getFullYear()} VagasOeste · Santarém, Pará<br>
                <a href="${siteUrl}" style="color:#065f46;text-decoration:none;">${siteDisplay}</a>
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
