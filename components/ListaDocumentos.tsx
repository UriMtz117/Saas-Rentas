"use client";
import { FileText, CheckCircle2, Trash2 } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ListaDocumentos({ documentos, inquilinoId }: { documentos: any, inquilinoId: string }) {
  const docs = Array.isArray(documentos) ? documentos : [];

  const handleDelete = async (docUrl: string) => {
    if (!confirm("¿Seguro que quieres eliminar este archivo?")) return;

    try {
        // 1. Extraer nombre del archivo del URL
        const fileName = docUrl.split('/documentos/')[1];

        // 2. Borrar de Supabase Storage
        const { error: storageError } = await supabase.storage
            .from('documentos')
            .remove([fileName]);

        if (storageError) throw storageError;

        // 3. Borrar de la Base de Datos
        const res = await fetch("/api/inquilinos/documentos/eliminar", {
            method: "POST",
            body: JSON.stringify({ inquilinoId, url: docUrl }),
        });

        if (res.ok) window.location.reload();
    } catch (err) {
        alert("Error al eliminar el documento.");
    }
  };

  return (
    <div className="bg-slate-900 p-10 rounded-[55px] text-white shadow-2xl relative overflow-hidden border-b-[12px] border-blue-600 min-h-[200px]">
        <div className="relative z-10">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 italic">Archivos Verificados</p>
            <div className="space-y-4">
                {docs.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 group">
                        <a href={doc.url} target="_blank" className="flex-1 flex items-center justify-between p-5 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5">
                            <div className="flex items-center gap-4">
                                <FileText size={18} className="text-blue-400" />
                                <span className="text-[10px] font-black truncate w-24 uppercase tracking-tighter">{doc.nombre}</span>
                            </div>
                            <CheckCircle2 size={16} className="text-green-500" />
                        </a>
                        <button 
                            onClick={() => handleDelete(doc.url)}
                            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {docs.length === 0 && <p className="text-xs text-slate-600 italic py-10 text-center uppercase font-black opacity-40">Vacío</p>}
            </div>
        </div>
    </div>
  );
}