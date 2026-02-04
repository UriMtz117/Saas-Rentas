"use client";
import { useState } from "react";
import { Camera, X, Loader2, Image as ImageIcon } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SubidaFotos({ onUploadComplete }: { onUploadComplete: (urls: string[]) => void }) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setSubiendo(true);
    const nuevasUrls = [...fotos];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('fotos-propiedades')
        .upload(fileName, file);

      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('fotos-propiedades').getPublicUrl(fileName);
        nuevasUrls.push(publicUrl);
      }
    }

    setFotos(nuevasUrls);
    onUploadComplete(nuevasUrls);
    setSubiendo(false);
  };

  const removeFoto = (index: number) => {
    const filtradas = fotos.filter((_, i) => i !== index);
    setFotos(filtradas);
    onUploadComplete(filtradas);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {fotos.map((url, i) => (
          <div key={i} className="relative h-24 rounded-2xl overflow-hidden border">
            <img src={url} className="w-full h-full object-cover" alt="preview" />
            <button onClick={() => removeFoto(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button>
          </div>
        ))}
        <label className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
          {subiendo ? <Loader2 className="animate-spin text-blue-600" /> : <><Camera size={20} className="text-slate-400" /><span className="text-[10px] font-black uppercase text-slate-400 mt-1">Añadir</span></>}
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={subiendo} />
        </label>
      </div>
    </div>
  );
}