"use client";
import { useState } from "react";
import { UploadCloud, FileText, Loader2, ShieldCheck, ChevronDown } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SubidaDocumentos({ inquilinoId }: { inquilinoId: string }) {
  const [subiendo, setSubiendo] = useState(false);
  const [tipo, setTipo] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!tipo) return alert("Por favor selecciona qué tipo de documento vas a subir.");
    if (!file || file.type !== "application/pdf") return alert("Solo se permiten archivos PDF.");

    setSubiendo(true);
    const fileName = `${inquilinoId}/${Date.now()}-${file.name}`;

    try {
      const { data, error: uploadError } = await supabase.storage.from('documentos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(fileName);

      // Guardamos con la ETIQUETA del tipo de documento
      await fetch("/api/inquilinos/documentos", {
        method: "POST",
        body: JSON.stringify({ 
            inquilinoId, 
            url: publicUrl, 
            nombre: tipo // Usamos el tipo como nombre oficial
        }),
      });

      window.location.reload();
    } catch (err) {
      alert("Error al procesar el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm text-center">
      <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-inner">
        <UploadCloud size={24}/>
      </div>
      <h3 className="text-sm font-black uppercase italic tracking-tighter mb-1">Digitalizar Expediente</h3>
      <p className="text-[9px] text-slate-400 font-bold uppercase mb-8">Carga tus documentos oficiales</p>
      
      <div className="space-y-4">
        {/* SELECTOR DE CATEGORÍA */}
        <div className="relative group">
            <select 
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-slate-500 appearance-none cursor-pointer focus:border-blue-500 transition-all"
            >
                <option value="">-- Seleccionar Categoría --</option>
                <option value="IDENTIFICACIÓN OFICIAL">🪪 Identificación Oficial (INE)</option>
                <option value="COMPROBANTE DE DOMICILIO">📍 Comprobante de Domicilio</option>
                <option value="COMPROBANTE DE INGRESOS">💰 Comprobante de Ingresos</option>
            </select>
            <ChevronDown className="absolute right-4 top-4 text-slate-300 pointer-events-none" size={16} />
        </div>

        {/* BOTÓN DE SUBIDA */}
        <label className={`
            w-full py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-95 shadow-xl
            ${tipo ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
        `}>
            {subiendo ? <Loader2 className="animate-spin" size={18} /> : <><FileText size={18}/> Seleccionar PDF</>}
            <input 
                type="file" 
                className="hidden" 
                accept=".pdf" 
                onChange={handleUpload} 
                disabled={subiendo || !tipo} 
            />
        </label>
      </div>
      <p className="mt-4 text-[8px] text-slate-300 font-black uppercase italic">Solo archivos .PDF autorizados</p>
    </div>
  );
}