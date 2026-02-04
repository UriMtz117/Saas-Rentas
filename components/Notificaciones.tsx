"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, FileText, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function Notificaciones() {
  const [isOpen, setIsOpen] = useState(false);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const searchParams = useSearchParams();

  const cargarAvisos = async () => {
    const uid = searchParams.get("uid") || localStorage.getItem("userId");
    if (!uid) return;

    setCargando(true);
    try {
      const res = await fetch(`/api/notificaciones?uid=${uid}`);
      const data = await res.json();
      setAvisos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAvisos();
  }, [searchParams, isOpen]);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="relative p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-90 group z-40">
        <Bell size={20} className={avisos.length > 0 ? "text-blue-600" : "text-slate-400"} />
        {avisos.length > 0 && (
          <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-bounce shadow-sm"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-[110] p-8 flex flex-col font-sans">
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Bandeja</h2>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Avisos del sistema</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={24} className="text-slate-300" /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {cargando && <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-100" /></div>}
                
                {avisos.map((aviso) => (
                  <div key={aviso.id} className="p-5 rounded-[30px] border border-slate-50 bg-blue-50/30 hover:bg-white hover:shadow-xl transition-all mb-4 border-l-[8px] border-l-blue-600">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-600 text-white shadow-lg"><FileText size={18} /></div>
                      <div>
                        <p className="font-black text-slate-800 text-xs uppercase tracking-tighter leading-tight mb-1">{aviso.mensaje}</p>
                        <div className="flex items-center gap-1 text-[8px] font-black text-slate-300 uppercase italic"><Clock size={10} /> Pendiente</div>
                      </div>
                    </div>
                  </div>
                ))}

                {avisos.length === 0 && !cargando && (
                  <div className="py-20 text-center opacity-30">
                    <Bell size={48} className="mx-auto mb-4 text-slate-200" />
                    <p className="font-black uppercase text-xs tracking-widest">Sin notificaciones</p>
                  </div>
                )}
              </div>

              {/* BOTÓN AL FINAL DEL PANEL */}
              <div className="pt-6 border-t border-slate-50">
                <button onClick={cargarAvisos} className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                  Actualizar Panel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}