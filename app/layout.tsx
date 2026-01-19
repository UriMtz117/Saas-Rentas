import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Chatbot from "../components/Chatbot";
import { LayoutDashboard, Home, Users, CreditCard, BarChart3, Bell } from "lucide-react";

export const metadata: Metadata = { title: "InmoGestion Pro - SaaS Inmobiliario" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 flex min-h-screen">
        {/* SIDEBAR PROFESIONAL */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen p-6">
          <div className="mb-10 flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg"><Home size={20}/></div>
            <span className="text-xl font-bold tracking-tight">InmoGestion</span>
          </div>

          <nav className="flex-1 space-y-2 text-sm font-medium">
            <Link href="/" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition"><LayoutDashboard size={18}/> Dashboard</Link>
            <Link href="/propiedades" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition"><Home size={18}/> Propiedades</Link>
            <Link href="/inquilinos" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition"><Users size={18}/> Inquilinos</Link>
            <Link href="/pagos" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition"><CreditCard size={18}/> Pagos</Link>
            <Link href="/reportes" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition"><BarChart3 size={18}/> Reportes</Link>
            <Link href="/recordatorios" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition"><Bell size={18}/> Recordatorios</Link>
          </nav>

          <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs">U</div>
              <p className="text-xs font-bold text-slate-400">Usuario Demo</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Chatbot />
      </body>
    </html>
  );
}