import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { Search, MapPin, ChevronRight, Globe } from "lucide-react";

export default async function ExplorarPage({ searchParams }: { searchParams: Promise<{ uid?: string; q?: string }> }) {
  const { uid, q } = await searchParams;

  // El inquilino ve TODO el catálogo para escoger
  const propiedades = await prisma.propiedad.findMany({
    where: q ? { OR: [{ nombre: { contains: q, mode: 'insensitive' } }, { direccion: { contains: q, mode: 'insensitive' } }] } : {},
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none italic">Marketplace</h1>
          <form className="w-full lg:max-w-xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
            <input name="q" defaultValue={q} placeholder="¿Qué ciudad buscas?..." className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[40px] shadow-2xl outline-none font-bold text-lg" />
            <input type="hidden" name="uid" value={uid} />
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {propiedades.map((p: any) => (
            <div key={p.id} className="bg-white rounded-[60px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-700 group">
              <div className="h-64 w-full bg-slate-100 relative grayscale group-hover:grayscale-0 transition-all duration-700">
                <iframe width="100%" height="100%" loading="lazy" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(p.direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}></iframe>
              </div>
              <div className="p-10">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2 italic">{p.nombre}</h2>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest mb-10"><MapPin size={14} className="text-red-500"/> {p.direccion}</div>
                <div className="flex justify-between items-center pt-8 border-t">
                  <p className="text-3xl font-black text-blue-600 tracking-tighter italic">${p.precio.toLocaleString()}</p>
                  <Link href={`/propiedades/${p.id}?uid=${uid}`} className="bg-slate-900 text-white p-5 rounded-[25px] hover:bg-blue-600 transition-all shadow-xl font-black text-[10px] uppercase tracking-widest">Ver Detalles</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}