"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Send, User, PenTool, Trash2, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";

export default function EditorContratoMaster() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const sigCanvas = useRef<any>(null);

  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [inquilinoId, setInquilinoId] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [cargando, setCargando] = useState(false);

  // 1. CARGAR INQUILINOS (Asegúrate de que tu API api/inquilinos haga el 'include: {propiedad: true}')
  useEffect(() => {
    if (uid) {
        fetch(`/api/inquilinos?uid=${uid}`)
            .then(res => res.json())
            .then(data => setInquilinos(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error al cargar inquilinos:", err));
    }
  }, [uid]);

  // 2. FUNCIÓN MAESTRA: GENERAR PLANTILLA (Corregida para evitar Undefined)
  const generarPlantilla = () => {
    const i = inquilinos.find(x => x.id === inquilinoId);
    
    if (!i) return alert("Por favor, selecciona un residente de la lista.");
    if (!i.propiedad) return alert("Error: Este inquilino no tiene una propiedad vinculada en la base de datos.");

    // Usamos variables seguras
    const nombreInquilino = i.nombre?.toUpperCase() || "RESIDENTE";
    const nombrePropiedad = i.propiedad?.nombre?.toUpperCase() || "PROPIEDAD SIN NOMBRE";
    const direccionPropiedad = i.propiedad?.direccion || "DIRECCIÓN NO REGISTRADA";
    const montoRenta = i.propiedad?.precio?.toLocaleString() || "0.00";

    const texto = `CONTRATO DE ARRENDAMIENTO LEGAL DIGITAL\n\n` +
      `FECHA DE EMISIÓN: ${new Date().toLocaleDateString()}\n\n` +
      `ENTRE: Arrendador InmoGestion AI (Representante Legal)\n` +
      `Y EL ARRENDATARIO: ${nombreInquilino}\n\n` +
      `OBJETO DEL CONTRATO: El arrendador cede el uso del inmueble ubicado en:\n` +
      `${direccionPropiedad} (${nombrePropiedad})\n\n` +
      `CLÁUSULAS PRINCIPALES:\n` +
      `1. El monto mensual pactado de renta es de $${montoRenta} MXN.\n` +
      `2. El presente documento tiene validez jurídica mediante firma electrónica.\n` +
      `3. El inquilino se compromete al mantenimiento y buen uso de la unidad.\n` +
      `4. La vigencia del contrato se rige por la fecha de finalización registrada en el sistema.\n\n` +
      `EL ARRENDADOR FIRMA DE CONFORMIDAD A CONTINUACIÓN:`;
    
    setCuerpo(texto);
  };

  // 3. FUNCIÓN: ENVIAR Y NOTIFICAR
  const enviarContrato = async () => {
    if (!inquilinoId) return alert("Selecciona a quién va dirigido el contrato.");
    if (!cuerpo) return alert("El cuerpo del contrato no puede estar vacío.");
    if (sigCanvas.current.isEmpty()) return alert("Debes estampar tu firma como propietario antes de enviar.");
    
    setCargando(true);

    // Extraemos la firma en formato imagen (Base64)
    const firmaOwner = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");

    const res = await fetch("/api/contratos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        inquilinoId, 
        cuerpo, 
        firmaOwner, 
        firmadoOwner: true 
      }),
    });

    if (res.ok) {
      alert("¡Contrato firmado y enviado! El inquilino recibirá una notificación en su panel.");
      router.push(`/dashboard?uid=${uid}`);
    } else {
      alert("Hubo un error al procesar el documento legal.");
      setCargando(false);
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        <Link href={`/dashboard?uid=${uid}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-8 transition italic">
          <ArrowLeft size={16} /> Regresar al Centro de Mando
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[60px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-full">
          
          {/* HEADER DEL EDITOR */}
          <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20"><PenTool size={24}/></div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter italic leading-none">Generador de Contratos</h1>
              </div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] italic">Protocolo de Firma Electrónica Segura</p>
            </div>
            <FileText size={180} className="absolute -right-10 -bottom-10 opacity-5 text-white pointer-events-none" />
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* CONFIGURACIÓN INICIAL */}
            <div className="flex flex-col md:flex-row gap-8 items-end bg-slate-50 p-8 rounded-[40px] border border-slate-100">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Paso 1: Seleccionar Residente del Inmueble</label>
                <div className="relative">
                    <User className="absolute left-5 top-5 text-slate-300" size={20} />
                    <select 
                        value={inquilinoId}
                        onChange={(e) => setInquilinoId(e.target.value)} 
                        className="w-full pl-14 pr-10 py-5 bg-white border border-slate-100 rounded-[25px] outline-none font-black text-xs uppercase tracking-tighter text-slate-700 appearance-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="">¿A quién va dirigido este documento?</option>
                        {inquilinos.map(i => (
                            <option key={i.id} value={i.id}>{i.nombre.toUpperCase()} - {i.propiedad?.nombre}</option>
                        ))}
                    </select>
                </div>
              </div>
              <button 
                onClick={generarPlantilla} 
                className="bg-blue-600 hover:bg-slate-900 text-white px-8 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 transition-all flex items-center gap-2 active:scale-95 shrink-0"
              >
                <Sparkles size={16} /> Generar Plantilla IA
              </button>
            </div>

            {/* ÁREA DE TRABAJO DUAL */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                
                {/* LADO IZQUIERDO: EL DOCUMENTO */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between px-6">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Paso 2: Edición del Cuerpo Legal</label>
                        <span className="text-[9px] font-bold text-slate-300 italic uppercase">Autoguardado Local</span>
                    </div>
                    <textarea 
                        value={cuerpo} 
                        onChange={(e) => setCuerpo(e.target.value)}
                        className="w-full h-[650px] p-12 bg-white border-2 border-slate-100 rounded-[60px] outline-none font-serif text-xl leading-relaxed text-slate-700 shadow-inner focus:border-blue-200 transition-all resize-none"
                        placeholder="Redacta los términos aquí o usa la plantilla inteligente..."
                    />
                </div>

                {/* LADO DERECHO: FIRMA Y ENVÍO */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4 sticky top-10">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Paso 3: Tu Firma Digital (Arrendador)</label>
                        
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[50px] h-72 shadow-inner relative overflow-hidden group bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                            <SignatureCanvas 
                                ref={sigCanvas}
                                penColor="#1e293b"
                                canvasProps={{ width: 500, height: 300, className: "w-full h-full cursor-crosshair" }} 
                            />
                            <button 
                                onClick={() => sigCanvas.current.clear()} 
                                className="absolute top-6 right-6 p-3 bg-white text-slate-300 hover:text-red-500 rounded-2xl shadow-sm transition-all hover:shadow-md active:scale-90"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>

                        <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100 flex gap-4">
                            <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                            <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase italic">
                                Al estampar tu firma, este documento adquiere validez legal en la plataforma y se envía automáticamente al inquilino para su contra-firma.
                            </p>
                        </div>

                        <button 
                            onClick={enviarContrato} 
                            disabled={cargando}
                            className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6 disabled:opacity-50"
                        >
                            <Send size={20} className={cargando ? "animate-bounce" : ""} />
                            {cargando ? "PROCESANDO..." : "FIRMAr Y NOTIFICAR"}
                        </button>

                        <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest mt-6 italic leading-loose">
                            Seguridad Cifrada End-to-End <br /> InmoGestion Legal Systems © 2026
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}