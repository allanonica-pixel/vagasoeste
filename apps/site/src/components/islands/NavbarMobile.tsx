import { useState } from 'react';

interface NavLink {
  label: string;
  href: string;
}

interface NavbarMobileProps {
  navLinks: NavLink[];
  appUrl?: string;
}

export default function NavbarMobile({ navLinks, appUrl = 'https://app.santarem.app' }: NavbarMobileProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão hambúrguer */}
      <button
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
        style={{ color: '#059669' }}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
      >
        <i className={`text-xl ${open ? 'ri-close-line' : 'ri-menu-line'}`}></i>
      </button>

      {/* Menu Mobile */}
      {open && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-4 flex flex-col gap-1 z-50">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 py-2.5 px-3 rounded-md transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-gray-100">
            <a
              href={`${appUrl}/login`}
              className="text-sm font-medium text-center py-2.5 rounded-lg hover:bg-emerald-50 transition-colors"
              style={{ border: '1px solid #059669', color: '#059669' }}
              onClick={() => setOpen(false)}
            >
              Entrar
            </a>
            <a
              href={`${appUrl}/cadastro`}
              className="text-sm font-semibold text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              Cadastrar-se
            </a>
          </div>
        </div>
      )}
    </>
  );
}
