import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  base: { service: process.env.LOG_LABEL ?? 'api' },
  // Em dev: output colorido e legível
  // Em prod: JSON estruturado para Axiom/Logtail
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,
  // Campos obrigatórios em toda linha de log
  formatters: {
    level: (label) => ({ level: label }),
  },
  // Nunca logar PII em claro — só hashes
  redact: {
    paths: ['req.headers.authorization', 'body.password', 'body.cpf', 'body.cnpj'],
    censor: '[REDACTED]',
  },
});
