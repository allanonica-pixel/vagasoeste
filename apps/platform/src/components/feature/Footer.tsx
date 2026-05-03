import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Vagas Disponíveis", href: "/vagas" },
  { label: "Como Funciona", href: "/como-funciona" },
  { label: "Para Empresas", href: "/para-empresas" },
  { label: "Blog de Carreira", href: "/blog" },
  { label: "Dicas de Vaga", href: "/dicas-de-vaga" },
  { label: "Crie seu Currículo", href: "/crie-seu-curriculo" },
];

const socialLinks = [
  { icon: "ri-instagram-line", href: "#", label: "Instagram VagasOeste" },
  { icon: "ri-facebook-line", href: "#", label: "Facebook VagasOeste" },
  { icon: "ri-linkedin-line", href: "#", label: "LinkedIn VagasOeste" },
  { icon: "ri-whatsapp-line", href: "#", label: "WhatsApp VagasOeste" },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                <i className="ri-briefcase-line text-sm text-white" aria-hidden="true"></i>
              </div>
              <span className="font-bold text-xl tracking-tight">
                Vagas<span className="text-emerald-400">Oeste</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              A plataforma que conecta candidatos a vagas de emprego em Santarém e região oeste do Pará
              com segurança, anonimato e agilidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Links</p>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-stone-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Contato</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-stone-400 text-sm">
                <i className="ri-whatsapp-line text-emerald-400 text-base shrink-0" aria-hidden="true"></i>
                (93) 99999-0000
              </li>
              <li className="flex items-center gap-2 text-stone-400 text-sm">
                <i className="ri-mail-line text-emerald-400 text-base shrink-0" aria-hidden="true"></i>
                contato@santarem.app
              </li>
              <li className="flex items-start gap-2 text-stone-400 text-sm">
                <i className="ri-map-pin-line text-emerald-400 text-base shrink-0 mt-0.5" aria-hidden="true"></i>
                <span>Santarém, Pará — Brasil</span>
              </li>
            </ul>

            {/* Redes sociais */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-emerald-600 text-stone-400 hover:text-white transition-colors"
                >
                  <i className={`${social.icon} text-sm`} aria-hidden="true"></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-stone-500 text-xs">
            © {new Date().getFullYear()} VagasOeste. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacidade" className="text-stone-500 hover:text-stone-300 text-xs transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="text-stone-500 hover:text-stone-300 text-xs transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
