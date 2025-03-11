import React, { useState } from "react";

const menuItems = [
  // { name: "Inicio", href: "/" },
  // { name: "Buscar", href: "/buscar" },
  // { name: "Contacto", href: "/contacto" },
];

const buttons = [
  // { text: "Iniciar", className: "bg-gray-200 text-gray-800 shadow-lg hover:shadow-xl active:shadow-inner" },
  // { text: "Registrar", className: "bg-gray-200 text-gray-800 shadow-lg hover:shadow-xl active:shadow-inner" },
];

const HeaderButton = ({ text, icon, className, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-lg flex items-center justify-center border-[1.5px] border-gray-300 shadow-lg hover:shadow-xl active:shadow-inner transition-all ${className}`}
  >
    {icon || text}
  </button>
);

const NavigationLink = ({ text, href }) => (
  <a
    href={href}
    className="relative text-[#fff] font-bold after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full hover:after:h-[3px] after:bg-gray-400 transition-all"
  >
    {text}
  </a>
);

export default function UIHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 font-sans">
      <header className="flex justify-between items-center px-6 py-4 bg-[#5b3a6877] rounded-2xl border-[1.5px] border-gray-300">
        
        <div className="flex items-center gap-3">
          <HeaderButton
            className="w-10 h-10 bg-gray-200 rounded-full shadow-lg hover:shadow-xl active:shadow-inner flex items-center justify-center"
            icon={
              <img
                src="https://i.pinimg.com/736x/e3/da/0c/e3da0c4a83b4ff5c516d1eed155e6f51.jpg"
                alt="Profile Icon"
                className="w-8 h-8 object-cover rounded-full"
              />
            }
          />
          <HeaderButton text="+" className="w-10 h-10 bg-gray-200 text-gray-800 rounded-lg shadow-lg hover:shadow-xl active:shadow-inner" />
        </div>

        <nav className="hidden md:flex gap-6 text-gray-700 font-semibold">
          {menuItems.map((item) => (
            <NavigationLink key={item.name} text={item.name} href={item.href} />
          ))}
        </nav>

        <div className="hidden md:flex gap-4">
          {buttons.map((btn, index) => (
            <HeaderButton key={index} text={btn.text} className={btn.className} />
          ))}
        </div>

        <div className="md:hidden">
          <HeaderButton 
            className="w-10 h-10 bg-gray-200 text-gray-800 rounded-lg shadow-lg hover:shadow-xl active:shadow-inner"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            }
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </header>

      {isOpen && (
        <div className="mt-3 bg-[#ffffff4f] rounded-xl border-[1.5px] border-gray-300 p-4 md:hidden">
          <nav className="flex flex-col gap-4 text-gray-700 font-semibold">
            {menuItems.map((item) => (
              <NavigationLink key={item.name} text={item.name} href={item.href} />
            ))}
          </nav>
          <div className="flex flex-col gap-3 mt-4">
            {buttons.map((btn, index) => (
              <HeaderButton key={index} text={btn.text} className={btn.className} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
