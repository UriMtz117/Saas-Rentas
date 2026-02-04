import { prisma } from "../../lib/prisma";
import { Bell, MessageCircle, User, ShieldCheck, Activity, Zap, MapPin } from "lucide-react";

export default async function RecordatoriosPage({ 
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
  // Solo traemos pagos que NO estén pagados.
  // Si es ADMIN, traemos todos los pendientes del sistema.
  // Si es USER, solo los pendientes de sus propiedades.
  const pendientes = await prisma.pago.findMany({
    where: {
      estado: { not: "PAGADO" },
      inquilino: isAdmin ? {} : {
        propiedad: {
          usuarioId: uid || "no-access"
        }
      }
    },
    include: { 
        inquilino: { include: { propiedad: true } } 
    },
    orderBy: { fechaPago: 'desc' }
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* ENCABEZADO PREMIUM */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-red-100 p-5 rounded-[28px] text-red-600 shadow-lg shadow-red-100 animate-pulse">
                <Bell size={32} />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    {isAdmin ? (
                        <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md">
                            <ShieldCheck size={10} /> Central de Cobranza Global
                        </span>
                    ) : (
                        <span className="bg-slate-200 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            Mi Gestor de Cobros
                        </span>
                    )}
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Recordatorios</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                    <Activity size={14} className="text-red-500" /> {pendientes.length} cuentas por liquidar
                </p>
            </div>
          </div>
        </div>

        {/* LISTA DE DEUDORES CON DISEÑO DE TARJETA DE ALTA GAMA */}
        <div className="grid gap-6">
          {pendientes.map((p: any) => {
            // Lógica para limpiar el teléfono y generar link de WhatsApp
            const telLimpio = p.inquilino.telefono.replace(/\D/g, "");
            const mensaje = encodeURIComponent(
              `Hola ${p.inquilino.nombre}, te saludamos de InmoGestion. Te recordamos tu pago de renta pendiente de $${p.monto.toLocaleString()} correspondiente al periodo ${p.mesPagado}. ¡Saludos!`
            );
            const whatsappLink = `https://wa.me/${telLimpio}?text=${mensaje}`;

            return (
              <div key={p.id} className="bg-white p-8 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col md:flex-row justify-between items-center gap-8 group relative overflow-hidden">
                
                <div className="flex items-center gap-6 w-full md:w-auto relative z-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-300 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-red-200">
                        <User size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{p.mesPagado}</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic group-hover:text-red-600 transition-colors">{p.inquilino.nombre}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1 mt-1">
                            <MapPin size={12} className="text-slate-300" /> {p.inquilino.propiedad.nombre}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end relative z-10 border-t md:border-0 pt-6 md:pt-0">
                    <div className="text-right">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter italic">${p.monto.toLocaleString()}</p>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 inline-block">Monto en Mora</span>
                    </div>

                    {/* BOTÓN DE WHATSAPP DINÁMICO */}
                    <a 
                      href={whatsappLink}
                      target="_blank"
                      className="bg-green-500 hover:bg-green-600 text-white p-5 rounded-[22px] shadow-xl shadow-green-100 transition-all active:scale-90 flex items-center gap-2 group/btn"
                    >
                        <MessageCircle size={22} className="group-hover/btn:rotate-12 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Cobrar</span>
                    </a>
                </div>

                {/* Adorno visual de fondo */}
                <div className="absolute -right-8 -bottom-8 opacity-0 group-hover:opacity-[0.03] text-slate-900 transition-opacity pointer-events-none">
                    <Bell size={200} />
                </div>
              </div>
            );
          })}

          {/* ESTADO DE CARTERA SANA */}
          {pendientes.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[60px] p-32 text-center flex flex-col items-center shadow-inner">
                <div className="bg-green-50 w-24 h-24 rounded-[40px] flex items-center justify-center mb-8 text-green-500 border border-green-100 shadow-sm">
                    <Zap size={48} fill="currentColor" />
                </div>
                <h4 className="text-slate-800 font-black text-2xl uppercase tracking-tighter italic">Cartera Sana</h4>
                <p className="text-slate-300 font-bold text-sm mt-1 uppercase tracking-widest italic">No existen cobros pendientes en este momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}