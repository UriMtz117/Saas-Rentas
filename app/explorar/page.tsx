"use client";
import { useState, useEffect } from "react";
import { 
  Search, MapPin, ChevronRight, SlidersHorizontal, 
  X, Loader2, ChevronLeft, AlertCircle, Building2, 
  Home as HomeIcon, Hotel, Clock, ArrowUpDown, DollarSign 
} from "lucide-react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";

export default function ExplorarMarketplaceCompleto() {
  const [data, setData] = useState<any>({ items: [], total: 0, totalPages: 1 });
  const [filtros, setFiltros] = useState({ q: '', tipo: 'TODOS', min: '', max: '', sort: 'newest', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      // Obtenemos el ID de forma interna (no aparecerá en la barra de direcciones)
      const uid = typeof window !== 'undefined' ? localStorage.getItem("userId") : "";
      
      // Enviamos el ID a la API para que filtre, pero el usuario no lo ve arriba
      const params = new URLSearchParams({ ...filtros, uid: uid || "" } as any).toString();
      const res = await fetch(`/api/explorar?${params}`);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchResults, 400); 
    return () => clearTimeout(timer);
  }, [filtros]);

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900 italic-none">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none italic italic">Marketplace</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">Búsqueda Inteligente de Activos</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* SIDEBAR DE FILTROS */}
          <aside className="bg-white p-8 rounded-[50px] shadow-sm border border-slate-100 h-fit space-y-10 shadow-2xl shadow-blue-500/5">
            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-blue-600 italic">
                <SlidersHorizontal size={14}/> Panel de Filtros
            </div>

            {/* SECCIÓN: ORDEN POR FECHA */}
            <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Fecha de Publicación</p>
                <div className="flex flex-col gap-2">
                    <button onClick={() => setFiltros({...filtros, sort: 'newest', page: 1})} className={`p-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${filtros.sort === 'newest' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}><Clock size={14} /> Más Recientes</button>
                    <button onClick={() => setFiltros({...filtros, sort: 'oldest', page: 1})} className={`p-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${filtros.sort === 'oldest' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}><Clock size={14} className="rotate-180" /> Más Antiguos</button>
                </div>
            </div>

            {/* SECCIÓN: ORDEN POR PRECIO */}
            <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Valor de Renta</p>
                <div className="flex flex-col gap-2">
                    <button onClick={() => setFiltros({...filtros, sort: 'price_asc', page: 1})} className={`p-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${filtros.sort === 'price_asc' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}><ArrowUpDown size={14} /> Menor a Mayor</button>
                    <button onClick={() => setFiltros({...filtros, sort: 'price_desc', page: 1})} className={`p-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${filtros.sort === 'price_desc' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}><ArrowUpDown size={14} className="rotate-180" /> Mayor a Menor</button>
                </div>
            </div>

            {/* SECCIÓN: RANGO DE PRECIOS */}
            <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Rango Mensual ($)</p>
                <div className="flex gap-2">
                    <div className="relative w-1/2">
                        <DollarSign className="absolute left-3 top-3.5 text-slate-300" size={12} />
                        <input placeholder="Min" type="number" value={filtros.min} onChange={(e)=>setFiltros({...filtros, min: e.target.value, page: 1})} className="w-full pl-7 p-3 bg-slate-50 rounded-xl outline-none text-xs font-bold border border-transparent focus:border-blue-500 transition-all shadow-inner" />
                    </div>
                    <div className="relative w-1/2">
                        <DollarSign className="absolute left-3 top-3.5 text-slate-300" size={12} />
                        <input placeholder="Max" type="number" value={filtros.max} onChange={(e)=>setFiltros({...filtros, max: e.target.value, page: 1})} className="w-full pl-7 p-3 bg-slate-50 rounded-xl outline-none text-xs font-bold border border-transparent focus:border-blue-500 transition-all shadow-inner" />
                    </div>
                </div>
            </div>

            {/* SECCIÓN: CATEGORÍA */}
            <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Tipo de Inmueble</p>
                <select value={filtros.tipo} onChange={(e) => setFiltros({...filtros, tipo: e.target.value, page: 1})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-slate-700 border-none shadow-inner">
                    <option value="TODOS">Todos los inmuebles</option>
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Cuarto">Cuarto</option>
                </select>
            </div>

            <button onClick={() => window.location.reload()} className="w-full py-4 text-slate-300 font-black text-[9px] uppercase hover:text-red-500 transition-all border-t border-slate-50 pt-6 italic tracking-widest">Limpiar todo</button>
          </aside>

          {/* ÁREA DE RESULTADOS */}
          <div className="lg:col-span-3 space-y-8">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition" size={24} />
                <input placeholder="Busca por nombre de edificio o calle..." className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[40px] shadow-2xl outline-none font-bold text-lg focus:ring-4 focus:ring-blue-500/5 transition-all" onChange={(e) => setFiltros({...filtros, q: e.target.value, page: 1})} />
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-8 rounded-[40px] border border-red-100 flex items-center gap-4 font-black text-xs uppercase tracking-widest italic animate-pulse shadow-sm"><AlertCircle size={24} /> {error}</div>
            )}

            {loading ? (
                <div className="py-40 text-center flex flex-col items-center gap-4 opacity-50"><Loader2 className="animate-spin text-blue-600" size={48} /><p className="font-black uppercase text-[10px] tracking-[0.4em] text-slate-300 italic">Sincronizando Mercado...</p></div>
            ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.items.map((p: any) => (
                        <div key={p.id} className="bg-white rounded-[55px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-700 group flex flex-col relative">
                            <div className="h-56 bg-slate-900 grayscale group-hover:grayscale-0 transition-all duration-1000 border-b">
                                <iframe width="100%" height="100%" loading="lazy" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(p.direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}></iframe>
                            </div>
                            <div className="p-8 flex-1 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter line-clamp-1 italic italic italic">{p.nombre}</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10 flex items-center gap-2 mt-1 italic"><MapPin size={12} className="text-red-500" /> {p.direccion}</p>
                                </div>
                                <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                                    <div><p className="text-[9px] font-black text-slate-300 uppercase mb-1 italic">Mensualidad</p><p className="text-3xl font-black text-blue-600 tracking-tighter italic">${p.precio.toLocaleString()}</p></div>
                                    
                                    {/* URL LIMPIA EN EL LINK */}
                                    <Link href={`/propiedades/${p.id}`} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl">
                                        <ChevronRight/>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {data.total === 0 && !error && (
                    <div className="py-40 text-center opacity-30 flex flex-col items-center italic font-black uppercase tracking-widest text-slate-400"><Search size={64} className="mb-6" />Cero Coincidencias</div>
                )}

                {/* PAGINACIÓN */}
                {data.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-6 pt-20">
                        <button disabled={filtros.page === 1} onClick={() => setFiltros({...filtros, page: filtros.page - 1})} className="p-5 bg-white border border-slate-100 rounded-3xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronLeft size={20}/></button>
                        <span className="font-black text-xs uppercase tracking-widest italic">Página {data.page} de {data.totalPages}</span>
                        <button disabled={filtros.page === data.totalPages} onClick={() => setFiltros({...filtros, page: filtros.page + 1})} className="p-5 bg-white border border-slate-100 rounded-3xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronRight size={20}/></button>
                    </div>
                )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}