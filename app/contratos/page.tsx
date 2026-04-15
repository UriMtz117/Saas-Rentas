import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { FileText, PenTool, CheckCircle2, Building2, ArrowRight, ShieldCheck, Search } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MisContratosPage() {
  // 1. OBTENEMOS EL ID DEL USUARIO DESDE LA COOKIE (URL LIMPIA)
  const cookieStore = await cookies();
  const uid = cookieStore.get("userId")?.value;

  if (!uid) redirect("/login");

  // 2. IDENTIFICAMOS EL ROL DEL USUARIO
  const user = await prisma.usuario.findUnique({
    where: { id: uid },
    select: { rol: true }
  });

  const role = user?.rol || "INQUILINO";
  const isAdmin = role === "ADMIN";
  const isOwner = role === "PROPIETARIO";

  // 3. LÓGICA DE FILTRADO MAESTRA
  let filter: any = {};

  if (isAdmin) {
    // Admin: Ve todos los contratos del sistema
    filter = {};
  } else if (isOwner) {
    // Propietario: Ve contratos de inquilinos que viven en SUS casas
    filter = { 
      inquilino: { 
        propiedad: { usuarioId: uid } 
      } 
    };
  } else {
    // Inquilino: Ve solo sus propios contratos
    filter = { 
      inquilino: { usuarioId: uid } 
    };
  }

  // 4. CONSULTA A LA BASE DE DATOS
  const contratos = await prisma.contrato.findMany({
    where: filter,
    include: { 
      inquilino: { 
        include: { propiedad: true } 
      } 
    },
    orderBy: { firmado: 'asc' } // Mostramos los pendientes de firma primero
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900 italic-none">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO DINÁMICO */}
        <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
                {isAdmin ? (
                    <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <ShieldCheck size={10} /> Auditoría de Documentos Global
                    </span>
                ) : (
                    <span className="bg-slate-200 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">
                        {isOwner ? "Mis Acuerdos Emitidos" : "Mis Documentos Legales"}
                    </span>
                )}
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic italic">
                {isOwner ? "Gestión de Contratos" : "Mis Contratos"}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-2 italic">
                {contratos.length} documentos localizados en la red
            </p>
        </div>

        {/* GRID DE DOCUMENTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {contratos.map((c: any) => (
            <div key={c.id} className="bg-white p-10 rounded-[60px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-10">
                    <div className="bg-blue-50 p-4 rounded-3xl text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <FileText size={32} />
                    </div>
                    {c.firmado ? (
                        <div className="bg-green-50 text-green-600 p-2 rounded-xl border border-green-100"><CheckCircle2 size={20} /></div>
                    ) : (
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-xl border border-amber-100 animate-pulse"><PenTool size={20} /></div>
                    )}
                </div>

                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Propiedad Vinculada</p>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-2 tracking-tighter line-clamp-1 italic italic">{c.inquilino.propiedad.nombre}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-10 italic">{c.inquilino.nombre}</p>
                </div>
                
                <div className="mt-auto">
                    {/* LÓGICA DE BOTONES SEGÚN EL ESTADO DEL CONTRATO */}
                    {!c.firmado ? (
                        <Link 
                          href={role === "INQUILINO" ? `/contratos/firmar/${c.id}` : `/contratos/ver/${c.id}`} 
                          className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all active:scale-95"
                        >
                            {role === "INQUILINO" ? "Revisar y Firmar" : "Ver Estado de Firma"} <PenTool size={14}/>
                        </Link>
                    ) : (
                        <Link 
                          href={`/contratos/ver/${c.id}`} 
                          className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95"
                        >
                             Ver Documento Final <CheckCircle2 size={14} className="text-green-400" />
                        </Link>
                    )}
                </div>

                {/* Adorno visual de fondo */}
                <Building2 size={180} className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none" />
            </div>
          ))}

          {/* ESTADO VACÍO */}
          {contratos.length === 0 && (
            <div className="col-span-full py-40 text-center flex flex-col items-center opacity-30">
                <div className="bg-slate-50 p-10 rounded-full mb-6 shadow-inner border border-slate-100">
                    <Search size={64} className="text-slate-200" />
                </div>
                <h4 className="text-slate-800 font-black text-2xl tracking-tighter uppercase italic">Cero Documentos</h4>
                <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest italic italic italic">No hemos localizado acuerdos legales en esta cuenta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}