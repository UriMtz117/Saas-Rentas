"use client"; // <--- VITAL
import { Printer, Share2 } from "lucide-react";

export default function AccionesContrato() {
  return (
    <div className="p-10 no-print border-t border-slate-100 bg-slate-50/50">
        <button 
            onClick={() => window.print()}
            className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
            <Printer size={20} /> Descargar Contrato en PDF
        </button>
    </div>
  );
}