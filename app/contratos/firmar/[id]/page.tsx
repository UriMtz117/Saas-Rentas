"use client";
import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { motion } from "framer-motion";
import { CheckCircle2, PenTool, Trash2, FileText, ShieldCheck, ArrowLeft, Award } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function FirmarContrato() {
  // 1. Obtenemos el ID del contrato de la URL
  const { id } = useParams();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  const sigCanvas = useRef<any>(null);
  const [contrato, setContrato] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [enviado, setEnviado] = useState(false);

  // 2. CARGAR EL CONTENIDO DEL CONTRATO (Incluyendo la firma del dueño)
  useEffect(() => {
    const obtenerContrato = async () => {
      try {
        const res = await fetch(`/api/contratos/detalle?id=${id}`);
        const data = await res.json();
        setContrato(data);
      } catch (error) {
        console.error("Error al cargar contrato:", error);
      } finally {
        setCargando(false);
      }
    };
    if (id) obtenerContrato();
  }, [id]);

  // 3. GUARDAR LA FIRMA DEL INQUILINO EN LA BASE DE DATOS
  const guardarFirma = async () => {
    if (sigCanvas.current.isEmpty()) return alert("Por favor dibuja tu firma primero");
    
    // Convertimos el dibujo a una imagen Base64
    const firmaData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");

    const res = await fetch(`/api/contratos/firmar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contratoId: id, 
        firmaImg: firmaData 
      })
    });

    if (res.ok) {
      setEnviado(true);
    } else {
      alert("Hubo un error al procesar la firma digital.");
    }
  };

  if (cargando) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 font-black italic text-slate-300 uppercase tracking-widest animate-pulse">
        Cargando Documento Legal...
    </div>
  );

  if (enviado) return (
    <div className="h-screen bg-green-500 flex items-center justify-center text-white text-center p-10 font-sans">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <CheckCircle2 size={120} className="mx-auto mb-8 shadow-2xl shadow-green-600" />
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">¡Documento Firmado!</h1>
        <p className="mt-4 font-bold opacity-80 uppercase text-xs tracking-widest mb-10">El contrato ha sido legalizado con éxito y guardado en tu expediente.</p>
        <button 
            onClick={() => window.location.href=`/dashboard?uid=${uid}`}
            className="bg-white text-green-600 px-10 py-5 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-transform"
        >
            Regresar al Panel
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto pb-20">
        
        <Link href={`/dashboard?uid=${uid}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-10 transition italic">
          <ArrowLeft size={16} /> Salir sin guardar
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-2xl rounded-[50px] overflow-hidden border border-slate-200">
            {/* Cabecera Legal */}
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="text-blue-500" size={24} />
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter italic">Acuerdo de Arrendamiento</h2>
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocolo de Validación Digital</p>
                </div>
                <ShieldCheck size={80} className="absolute -right-4 -bottom-4 opacity-10" />
            </div>

            {/* CUERPO DEL CONTRATO (Con la firma del dueño integrada) */}
            <div className="p-10 md:p-16">
                <div className="bg-slate-50 p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-inner">
                    <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-700 italic">
                        {contrato?.cuerpo || "No hay contenido disponible para este documento."}
                    </div>

                    {/* MUESTRA LA FIRMA DEL DUEÑO SI YA EXISTE */}
                    {contrato?.firmaOwner && (
                        <div className="mt-12 pt-8 border-t border-slate-200 max-w-xs">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Firma del Arrendador:</p>
                            <img 
                                src={contrato.firmaOwner} 
                                alt="Firma del Dueño" 
                                className="h-24 w-auto grayscale contrast-125 mix-blend-multiply" 
                            />
                            <div className="mt-2 flex items-center gap-2 text-blue-600 font-black text-[8px] uppercase tracking-tighter">
                                <Award size={12} /> Firmado y Validado Electrónicamente
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ÁREA DE FIRMA PARA EL INQUILINO */}
            <div className="p-10 md:p-16 border-t border-dashed border-slate-200 bg-slate-50/50">
                <div className="text-center mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic italic">Tu Firma de Conformidad</h3>
                    <p className="text-slate-300 text-[9px] mt-1 uppercase font-bold tracking-widest italic">Dibuja tu rúbrica en el recuadro gris</p>
                </div>
                
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] overflow-hidden mb-10 h-72 shadow-inner relative group bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                    <SignatureCanvas 
                        ref={sigCanvas}
                        penColor="#1e293b"
                        canvasProps={{ width: 800, height: 300, className: "w-full h-full cursor-crosshair" }} 
                    />
                    <button 
                        onClick={() => sigCanvas.current.clear()} 
                        className="absolute top-6 right-6 p-3 bg-white text-slate-300 hover:text-red-500 rounded-2xl shadow-sm transition-all active:scale-90 border border-slate-100"
                        title="Borrar dibujo"
                    >
                        <Trash2 size={20}/>
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={guardarFirma} 
                        className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <PenTool size={20} /> Estampar Firma y Finalizar
                    </button>
                    <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-widest mt-4">
                        Al confirmar, aceptas legalmente todas las cláusulas descritas en este acuerdo digital.
                    </p>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}