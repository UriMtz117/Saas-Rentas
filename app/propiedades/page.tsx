import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { Plus, Search, MapPin, ChevronRight, Home, ShieldCheck, Users, Globe } from "lucide-react";

export default async function PropiedadesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ uid?: string; q?: string }> 
}) {
  // 1. RESOLVEMOS LOS PARÁMETROS DE LA URL
  const params = await searchParams;
  const uid = params.uid;
  const q = params.q;

  // 2. IDENTIFICAMOS AL USUARIO Y SU ROL
  const user = await prisma.usuario.findUnique({ 
    where: { id: uid || "no-id" } 
  });
  
  const role = user?.rol || "INQUILINO";
  const isAdmin = role === "ADMIN";
  const isOwner = role === "PROPIETARIO";
  const isTenant = role === "INQUILINO";

  // 3. LÓGICA DE FILTRADO MAESTRA (Multi-tenancy)
  let filter: any = {};

  if (isOwner) {
    // Propietario: Solo ve las casas donde él es el dueño (usuarioId)
    filter.usuarioId = uid;
  } else if (isTenant) {
    // Inquilino: Solo ve las casas donde ÉL es el inquilino registrado
    filter.inquilinos = {
      some: {
        usuarioId: uid
      }
    };
  } else if (isAdmin) {
    // Admin: No hay filtro de ID, ve todo
    filter = {};
  }

  // 4. APLICAMOS LA BÚSQUEDA (Si el usuario escribió algo en el buscador)
  if (q) {
    filter.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { direccion: { contains: q, mode: 'insensitive' } }
    ];
  }

  // 5. CONSULTA FINAL A SUPABASE
  const propiedades = await prisma.propiedad.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- ENCABEZADO DINÁMICO --- */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
                {isAdmin && <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-blue-200"><ShieldCheck size={10} /> Supervisión Global</span>}
                {isOwner && <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic tracking-tighter">Mi Stock de Inmuebles</span>}
                {isTenant && <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100 italic">Mis Residencias Vinculadas</span>}
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none italic">
                {isTenant ? "Mis Casas" : "Inventario"}
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 italic">
                Total de unidades localizadas: {propiedades.length}
            </p>
          </div>

          {/* BARRA DE BÚSQUEDA */}
          <form className="w-full lg:max-w-xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
                name="q" 
                defaultValue={q} 
                placeholder={isTenant ? "Buscar en mis rentas..." : "Buscar casa o dirección..."} 
                className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-blue-500/5 outline-none font-bold text-lg focus:ring-4 focus:ring-blue-500/5 transition-all" 
            />
            <input type="hidden" name="uid" value={uid} />
          </form>
          
          {/* BOTÓN REGISTRAR (Oculto para inquilinos) */}
          {!isTenant && (
            <Link href={`/propiedades/nueva?uid=${uid}`} className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-[25px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-2 group active:scale-95 shrink-0">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Registrar
            </Link>
          )}
        </div>

        {/* --- GRID DE TARJETAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {propiedades.map((p: any) => (
            <Link href={`/propiedades/${p.id}?uid=${uid}`} key={p.id} className="group">
              <div className="bg-white rounded-[60px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col h-full relative">
                
                {/* MAPA DINÁMICO */}
                <div className="h-64 w-full bg-slate-100 relative grayscale group-hover:grayscale-0 transition-all duration-1000 border-b border-slate-50">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        loading="lazy" 
                        frameBorder="0" 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(p.direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-xl text-red-500 border border-white">
                        <MapPin size={20} />
                    </div>
                </div>

                <div className="p-10 flex-1 flex flex-col justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2 italic line-clamp-1">{p.nombre}</h2>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10 italic">
                            <Globe size={14} className="text-blue-500"/> {p.direccion}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase mb-1 italic">Mensualidad</p>
                            <p className="text-4xl font-black text-blue-600 tracking-tighter italic">${p.precio.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900 text-white p-5 rounded-[25px] group-hover:bg-blue-600 transition-all shadow-xl group-hover:shadow-blue-200">
                            <ChevronRight size={24}/>
                        </div>
                    </div>
                </div>

                {/* Badge de rol si es Admin */}
                {isAdmin && (
                    <div className="absolute top-4 left-4 bg-slate-900/40 backdrop-blur-md text-white text-[8px] px-2 py-1 rounded-md font-black uppercase">
                        UID: {p.usuarioId.slice(0,8)}...
                    </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* --- ESTADO DE CERO RESULTADOS --- */}
        {propiedades.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-10 rounded-[45px] mb-6 border border-slate-100 shadow-inner">
                    <Home size={64} className="text-slate-100" />
                </div>
                <h3 className="font-black italic uppercase text-3xl tracking-tighter text-slate-400">Carpeta Vacía</h3>
                <p className="text-slate-300 font-bold text-sm mt-1 uppercase tracking-widest italic text-balance px-20">
                    No se han encontrado unidades vinculadas a este perfil. 
                    {isTenant ? " Si buscas un lugar para vivir, ve a la sección Explorar Mercado." : " Comienza registrando tu primera propiedad."}
                </p>
                <Link href={isTenant ? `/explorar?uid=${uid}` : `/propiedades/nueva?uid=${uid}`} className="mt-8 text-blue-600 font-black text-xs uppercase tracking-[0.2em] border-b-2 border-blue-600 pb-1 hover:text-slate-900 hover:border-slate-900 transition-all">
                    {isTenant ? "Ir al Marketplace →" : "Registrar ahora →"}
                </Link>
            </div>
        )}

      </div>
    </div>
  );
}