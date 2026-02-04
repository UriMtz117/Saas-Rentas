import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { UserPlus, User, MapPin, ChevronRight, Users, ShieldCheck, Mail, Phone } from "lucide-react";

export default async function InquilinosPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ uid?: string }> 
}) {
  // 1. OBTENEMOS EL ID DEL USUARIO Y SU ROL
  const { uid } = await searchParams;
  const usuarioActual = await prisma.usuario.findUnique({
    where: { id: uid || "invitado" }
  });

  const isAdmin = usuarioActual?.rol === "ADMIN";

  // 2. FILTRO DE PRIVACIDAD DINÁMICO:
  // Si es ADMIN, traemos todos los inquilinos del sistema.
  // Si es USER, solo traemos los inquilinos cuyas casas pertenezcan a su ID.
  const inquilinos = await prisma.inquilino.findMany({
    where: isAdmin ? {} : {
      propiedad: {
        usuarioId: uid || "no-access"
      }
    },
    include: { propiedad: true },
    orderBy: { nombre: 'asc' }
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO PREMIUM */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                {isAdmin ? (
                    <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-blue-200">
                        <ShieldCheck size={12} /> Directorio Global Maestro
                    </span>
                ) : (
                    <span className="bg-slate-200 text-slate-500 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                        Mi Directorio de Residentes
                    </span>
                )}
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">
                {isAdmin ? "Residentes SaaS" : "Inquilinos"}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1 italic">
                {inquilinos.length} registros activos en el sistema
            </p>
          </div>
          
          <Link href={`/inquilinos/nuevo?uid=${uid}`} className="bg-green-600 hover:bg-slate-900 text-white px-10 py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-green-100 transition-all flex items-center gap-2 active:scale-95 group">
            <UserPlus size={20} className="group-hover:scale-110 transition-transform" /> 
            Registrar Residente
          </Link>
        </div>

        {/* LISTA DE INQUILINOS CON DISEÑO TIPO FICHA */}
        <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden border-b-8 border-b-blue-600">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                <tr>
                  <th className="p-8">Información del Residente</th>
                  <th className="p-8">Unidad Inmobiliaria</th>
                  <th className="p-8">Contacto Directo</th>
                  <th className="p-8 text-right">Expediente</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {inquilinos.map((i: any) => (
                  <tr key={i.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-all duration-300 group">
                    {/* COLUMNA NOMBRE */}
                    <td className="p-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner group-hover:shadow-blue-200">
                                <User size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-800 font-black uppercase text-base tracking-tighter italic">{i.nombre}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg w-fit font-black uppercase mt-1">Activo</span>
                            </div>
                        </div>
                    </td>

                    {/* COLUMNA PROPIEDAD */}
                    <td className="p-8">
                        <div className="flex items-center gap-3 text-slate-500 font-black uppercase italic text-xs tracking-tighter">
                            <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
                                <MapPin size={16} />
                            </div>
                            {i.propiedad.nombre}
                        </div>
                    </td>

                    {/* COLUMNA CONTACTO */}
                    <td className="p-8">
                        <div className="flex flex-col gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                            <span className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors"><Mail size={12}/> {i.correo}</span>
                            <span className="flex items-center gap-2 hover:text-green-500 cursor-pointer transition-colors"><Phone size={12}/> {i.telefono}</span>
                        </div>
                    </td>

                    {/* COLUMNA ACCIÓN */}
                    <td className="p-8 text-right">
                        <Link 
                          href={`/inquilinos/${i.id}?uid=${uid}`} 
                          className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                        >
                          Ver Historial <ChevronRight size={14} />
                        </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ESTADO VACÍO */}
          {inquilinos.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-10 rounded-[40px] mb-6 text-slate-200 shadow-inner">
                    <Users size={64} />
                </div>
                <h4 className="text-slate-800 font-black text-2xl tracking-tighter italic uppercase">Sin Residentes</h4>
                <p className="text-slate-300 font-bold text-sm mt-1 uppercase tracking-widest italic">No hay registros de inquilinos en esta cuenta.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}