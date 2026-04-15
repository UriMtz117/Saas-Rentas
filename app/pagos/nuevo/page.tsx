"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Lock, ArrowLeft, CheckCircle2, DollarSign, Calendar, Building2, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie"; // <--- VITAL PARA URLS LIMPIAS

export default function PagoTarjetaPremiumPage() {
  const router = useRouter();
  
  // 1. OBTENEMOS EL ID DEL USUARIO DESDE LA COOKIE (Invisible en la barra de direcciones)
  const uid = Cookies.get("userId");

  // ESTADOS PRINCIPALES
  const [step, setStep] = useState(1);
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  // DATOS DEL PAGO
  const [monto, setMonto] = useState("");
  const [mes, setMes] = useState("");
  const [propiedadId, setPropiedadId] = useState("");
  
  // DATOS VISUALES TARJETA
  const [numero, setNumero] = useState("**** **** **** ****");
  const [titular, setTitular] = useState("NOMBRE DEL TITULAR");

  // 2. CARGAR PROPIEDADES (Usando el ID de la cookie)
  useEffect(() => {
    if (!uid) {
        router.push("/login");
        return;
    }
    
    fetch(`/api/propiedades?uid=${uid}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPropiedades(data);
        setCargandoLista(false);
      })
      .catch(() => setCargandoLista(false));
  }, [uid, router]);

  const iniciarProcesamiento = () => {
    if (!monto || !mes || !propiedadId) return alert("Por favor, selecciona la propiedad y el monto.");
    setStep(2);
  };

  const finalizarPago = async () => {
    const res = await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquilinoId: uid, // Enviamos el ID desde la cookie
        propiedadId: propiedadId, 
        monto: parseFloat(monto),
        mesPagado: mes,
        estado: "PAGADO"
      }),
    });

    if (res.ok) {
      setStep(3);
    } else {
      alert("Error al procesar el pago. Intenta de nuevo.");
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-slate-900 italic-none">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[60px] shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100">
        <AnimatePresence mode="wait">
          
          {/* PASO 1: FORMULARIO */}
          {step === 1 && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 md:p-12">
              {/* URL LIMPIA EN EL REGRESAR */}
              <Link href="/dashboard" className="text-slate-300 font-black text-[10px] uppercase tracking-widest mb-8 inline-block hover:text-slate-900 transition italic">
                ← Cancelar Operación
              </Link>

              {/* TARJETA VISUAL DINÁMICA */}
              <div className="bg-slate-900 p-8 rounded-[40px] text-white mb-10 relative overflow-hidden shadow-2xl group transition-all italic">
                <div className="flex justify-between mb-12 relative z-10">
                    <CreditCard size={32} className="text-blue-500" />
                    <div className="w-12 h-8 bg-amber-400/20 border border-amber-400/30 rounded-lg backdrop-blur-md shadow-inner"></div>
                </div>
                <div className="relative z-10">
                    <p className="text-xl md:text-2xl font-mono tracking-[0.2em] mb-8 uppercase">{numero}</p>
                    <div className="flex justify-between font-bold uppercase text-[10px] italic">
                        <span>{titular}</span>
                        <span>12/28</span>
                    </div>
                </div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-20"></div>
              </div>

              <div className="space-y-6">
                {/* SELECTOR DE PROPIEDAD */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic italic">Unidad a liquidar</label>
                    <div className="relative">
                        <Building2 className="absolute left-5 top-5 text-slate-300" size={18} />
                        <select 
                            className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-black text-xs uppercase text-slate-700 appearance-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
                            onChange={(e) => setPropiedadId(e.target.value)}
                            value={propiedadId}
                            required
                        >
                            <option value="">{cargandoLista ? 'Buscando contratos...' : '-- Seleccionar --'}</option>
                            {propiedades.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-6 top-6 text-slate-300 pointer-events-none rotate-90" size={16} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-4 text-slate-300" size={16} />
                        <input type="number" placeholder="Monto" className="w-full pl-10 py-4 bg-slate-50 rounded-2xl outline-none font-black text-lg focus:border-blue-500 transition-all shadow-inner" onChange={(e) => setMonto(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-4 text-slate-300" size={16} />
                        <input type="text" placeholder="Periodo" className="w-full pl-10 py-4 bg-slate-50 rounded-2xl outline-none font-bold italic focus:border-blue-500 transition-all shadow-inner uppercase text-xs" onChange={(e) => setMes(e.target.value)} />
                    </div>
                </div>

                <input type="text" maxLength={19} placeholder="Número de Tarjeta" className="w-full p-5 bg-slate-50 rounded-3xl outline-none font-mono tracking-widest shadow-inner focus:border-blue-500 transition-all" 
                    onChange={(e) => setNumero(e.target.value.replace(/\d{4}/g, '$& ').trim())} 
                />
                
                <input type="text" placeholder="Nombre en Plástico" className="w-full p-5 bg-slate-50 rounded-3xl outline-none font-black uppercase shadow-inner focus:border-blue-500 transition-all text-sm" 
                    onChange={(e) => setTitular(e.target.value)} 
                />

                <button onClick={iniciarProcesamiento} className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-slate-900 transition-all active:scale-95 mt-4">
                    Confirmar Transacción
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 2: PROCESANDO */}
          {step === 2 && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center flex flex-col items-center">
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-12 shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-full bg-blue-600 shadow-lg" onAnimationComplete={finalizarPago} />
              </div>
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Validando Cobro...</h3>
              <div className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] mt-8 flex items-center justify-center gap-2"><ShieldCheck size={14} className="text-blue-500"/> Protocolo Seguro</div>
            </motion.div>
          )}

          {/* PASO 3: ÉXITO */}
          {step === 3 && (
            <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-16 text-center">
              <div className="bg-green-500 text-white w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-12"><CheckCircle2 size={48} /></div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 italic">¡Aprobado!</h2>
              <p className="text-slate-400 font-medium mb-10 text-pretty">Tu pago ha sido registrado en la red. Ya puedes descargar tu comprobante digital.</p>
              <button onClick={() => window.location.href="/dashboard"} className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Regresar al Panel</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}