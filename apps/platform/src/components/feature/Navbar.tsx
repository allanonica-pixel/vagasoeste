import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Vagas", href: "/vagas" },
    { label: "Blog", href: "/blog" },
    { label: "Crie seu Currículo", href: "/crie-seu-curriculo" },
    { label: "Como Funciona", href: "/como-funciona" },
    { label: "Para Empresas", href: "/para-empresas" },
  ];

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-300 ${
        isTransparent
          ? "bg-transparent"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className={`size-8 rounded-lg flex items-center justify-center ${isTransparent ? "bg-white/20" : "bg-emerald-600"}`}>
            <i className={`ri-briefcase-line text-sm ${isTransparent ? "text-white" : "text-white"}`} aria-hidden="true"></i>
          </div>
          <span className={`font-bold text-lg tracking-tight ${isTransparent ? "text-white" : "text-gray-900"}`}>
            Vagas<span className={isTransparent ? "text-emerald-300" : "text-emerald-600"}>Oeste</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isTransparent
                  ? "text-white/90 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className={`text-sm font-medium px-4 py-2 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              isTransparent
                ? "text-white border border-white/40 hover:bg-white/10"
                : "text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="text-sm font-semibold px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cadastrar-se
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          className={`md:hidden size-8 flex items-center justify-center cursor-pointer ${isTransparent ? "text-white" : "text-gray-700"}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className={`text-xl ${menuOpen ? "ri-close-line" : "ri-menu-line"}`} aria-hidden="true"></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 py-2 cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Link to="/login" className="text-sm font-medium text-center py-2 border border-gray-200 rounded-md text-gray-700 cursor-pointer" onClick={() => setMenuOpen(false)}>
              Entrar
            </Link>
            <Link to="/cadastro" className="text-sm font-semibold text-center py-2 bg-emerald-600 text-white rounded-md cursor-pointer" onClick={() => setMenuOpen(false)}>
              Cadastrar-se
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
