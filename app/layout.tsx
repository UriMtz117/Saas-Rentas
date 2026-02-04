"use client";
import { useState, useEffect } from "react";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Chatbot from "../components/Chatbot";
import PageTransition from "../components/PageTransition";
import { 
  LayoutDashboard, Home, Users, CreditCard, 
  BarChart3, Bell, ShieldCheck, LogOut, Search, Zap, Globe, FileText, Menu, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil
  const pathname = usePathname();

  // 1. CARGAR DATOS DE SESIÓN
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedId = localStorage.getItem("userId");
    const savedName = localStorage.getItem("userName");
    
    if (savedRole) setRole(savedRole);
    if (savedId) setUserId(savedId);
    if (savedName) setUserName(savedName);
    
    // Cierra el menú automáticamente al cambiar de página en el celular
    setIsMenuOpen(false);
  }, [pathname]);

  // Páginas públicas sin Sidebar
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register";

  if (isPublicPage) {
    return (
      <html lang="es">
        <body className="bg-white">{children}</body>
      </html>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <html lang="es">
      <body className="bg-[#f8fafc] text-slate-900 flex min-h-screen font-sans antialiased overflow-x-hidden">
        
        {/* --- HEADER MÓVIL (Solo visible en celulares/tablets) --- */}
        <header className="lg:hidden fixed top-0 left-0 w-full bg-slate-900 text-white p-4 flex justify-between items-center z-[60] shadow-xl">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Home size={18} /></div>
            <span className="font-black tracking-tighter uppercase italic text-sm text-blue-400">InmoGestion</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-slate-800 rounded-xl active:scale-90 transition-all"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* --- SIDEBAR RESPONSIVO --- */}
        <aside className={`
            fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-500 ease-in-out
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          
          {/* Logo (Visible solo en Desktop o cuando el menú está abierto) */}
          <div className="p-8 mb-4 flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <Home size={24} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter block leading-none uppercase italic">InmoGestion</span>
              <span className="text-[9px] font-black text-blue-400 tracking-[0.3em] uppercase tracking-tighter">Intelligence AI</span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mb-4 uppercase italic">Navegación</p>
            
            <SidebarLink href={`/dashboard?uid=${userId}`} icon={<LayoutDashboard size={18}/>} label="Dashboard" />

            {role === "INQUILINO" && (
                <>
                    <SidebarLink href={`/explorar?uid=${userId}`} icon={<Globe size={18} className="text-blue-400"/>} label="Explorar Mercado" />
                    <SidebarLink href={`/notificaciones?uid=${userId}`} icon={<Bell size={18} className="text-amber-400"/>} label="Notificaciones" />
                    <SidebarLink href={`/contratos?uid=${userId}`} icon={<FileText size={18} className="text-blue-400"/>} label="Mis Contratos" />
                </>
            )}
            
            <SidebarLink href={`/propiedades?uid=${userId}`} icon={<Home size={18}/>} label={role === "INQUILINO" ? "Mis Propiedades" : "Mi Inventario"} />

            {role !== "INQUILINO" && (
              <>
                <SidebarLink href={`/inquilinos?uid=${userId}`} icon={<Users size={18}/>} label="Gestión CRM" />
                <SidebarLink href={`/pagos?uid=${userId}`} icon={<CreditCard size={18}/>} label="Finanzas" />
                <SidebarLink href={`/reportes?uid=${userId}`} icon={<BarChart3 size={18}/>} label="Analítica Pro" />
                <SidebarLink href={`/recordatorios?uid=${userId}`} icon={<Bell size={18}/>} label="Cobranza" />
              </>
            )}

            {role === "ADMIN" && (
              <div className="pt-6 mt-6 border-t border-slate-800">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] ml-4 mb-4 italic uppercase">Administrador</p>
                <SidebarLink href="/admin" icon={<ShieldCheck size={18} className="text-blue-500"/>} label="Consola Maestro" />
              </div>
            )}
          </nav>

          {/* Perfil Inferior */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-xs uppercase shadow-inner">
                        {userName.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-slate-100 truncate tracking-tighter uppercase italic">{userName}</p>
                        <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">{role}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-all active:scale-90"><LogOut size={18} /></button>
          </div>
        </aside>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* Espaciado para compensar el header fijo en móviles */}
          <div className="lg:hidden h-16 w-full shrink-0"></div>

          <div className="flex-1 overflow-y-auto custom-scrollbar no-print px-4 md:px-10 pb-24">
             <PageTransition>
                {children}
             </PageTransition>
          </div>
        </main>

        <Chatbot />

        {/* OVERLAY: Fondo oscuro cuando el menú móvil está abierto */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden"
            />
          )}
        </AnimatePresence>

      </body>
    </html>
  );
}

function SidebarLink({ href, icon, label }: { href: string, icon: any, label: string }) {
  const pathname = usePathname();
  const cleanHref = href.split('?')[0];
  const isActive = pathname === cleanHref;

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group font-black text-[10px] uppercase tracking-[0.15em] ${
        isActive 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-[1.02]' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <span className={`${isActive ? 'text-white' : 'group-hover:text-blue-400'} transition-colors`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}