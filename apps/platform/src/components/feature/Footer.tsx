import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      await fetch("https://readdy.ai/api/form/d7gcf8c0ok5brd6lp3o0", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      setSubmitted(true);
      setEmail("");
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + Newsletter */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <i className="ri-briefcase-line text-sm text-white"></i>
              </div>
              <span className="font-bold text-xl tracking-tight">
                Vagas<span className="text-emerald-400">Oeste</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-sm">
              A plataforma que conecta candidatos a vagas de emprego na região oeste de São Paulo com segurança, anonimato e agilidade.
            </p>
            <p className="text-sm font-semibold text-white mb-3">Receba vagas no seu email</p>
            {submitted ? (
              <p className="text-emerald-400 text-sm font-medium">Ótimo! Você receberá as melhores vagas em breve.</p>
            ) : (
              <form
                data-readdy-form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-2"
              >
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                >
                  {submitting ? "..." : "Quero vagas"}
                </button>
              </form>
            )}
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Links</p>
            <ul className="space-y-3">
              {[
                { label: "Vagas Disponíveis", href: "/vagas" },
                { label: "Como Funciona", href: "/como-funciona" },
                { label: "Para Empresas", href: "/para-empresas" },
                { label: "Blog de Carreira", href: "/blog" },
                { label: "Links de Afiliados", href: "/afiliados" },
                { label: "Política de Privacidade", href: "/privacidade" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-stone-400 hover:text-white text-sm transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Contato</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-stone-400 text-sm">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-whatsapp-line text-emerald-400"></i>
                </div>
                (11) 99999-0000
              </li>
              <li className="flex items-center gap-2 text-stone-400 text-sm">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-mail-line text-emerald-400"></i>
                </div>
                contato@santarem.app
              </li>
              <li className="flex items-start gap-2 text-stone-400 text-sm">
                <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                  <i className="ri-map-pin-line text-emerald-400"></i>
                </div>
                <span>Região Oeste de São Paulo, SP</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: "ri-instagram-line", href: "#" },
                { icon: "ri-facebook-line", href: "#" },
                { icon: "ri-linkedin-line", href: "#" },
                { icon: "ri-whatsapp-line", href: "#" },
              ].map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-emerald-600 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <i className={`${social.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800 mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-stone-500 text-xs">
            © 2026 VagasOeste. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacidade" className="text-stone-500 hover:text-stone-300 text-xs cursor-pointer">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="text-stone-500 hover:text-stone-300 text-xs cursor-pointer">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
