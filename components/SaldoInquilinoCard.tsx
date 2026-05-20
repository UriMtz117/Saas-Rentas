import { AlertTriangle, CheckCircle2, Clock3, CreditCard } from "lucide-react";

type SaldoInquilinoCardProps = {
  nombre: string;
  saldoActual: number;
  rentaMensual?: number;
  ultimoPago?: string;
  estado?: "AL_DIA" | "MORA" | "A_FAVOR" | "PENDIENTE";
  notas?: string;
};

const estadoMeta = {
  AL_DIA: {
    label: "Al día",
    color: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },
  MORA: {
    label: "En mora",
    color: "bg-rose-50 text-rose-600",
    icon: AlertTriangle,
  },
  A_FAVOR: {
    label: "Saldo a favor",
    color: "bg-sky-50 text-sky-600",
    icon: CheckCircle2,
  },
  PENDIENTE: {
    label: "Pendiente",
    color: "bg-amber-50 text-amber-600",
    icon: Clock3,
  },
};

export default function SaldoInquilinoCard({
  nombre,
  saldoActual,
  rentaMensual,
  ultimoPago,
  estado,
  notas,
}: SaldoInquilinoCardProps) {
  const estadoClave = estado
    ? estado
    : saldoActual > 0
    ? "MORA"
    : saldoActual < 0
    ? "A_FAVOR"
    : "AL_DIA";

  const estadoData = estadoMeta[estadoClave];
  const Icon = estadoData.icon;
  const valorSaldo = Math.abs(saldoActual).toLocaleString();
  const etiquetaSaldo = saldoActual > 0 ? "Adeudo" : saldoActual < 0 ? "A favor" : "Sin saldo";

  return (
    <div className="bg-white border border-slate-100 rounded-[45px] shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
      <div className="bg-slate-950 text-white p-8 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-2">
              Saldo del inquilino
            </p>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
              {nombre}
            </h3>
          </div>
          <div className="w-16 h-16 rounded-[24px] bg-blue-500/10 text-blue-200 flex items-center justify-center shadow-inner">
            <CreditCard size={28} />
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <span className={`inline-flex items-center gap-2 ${estadoData.color} px-4 py-2 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em]`}>
            <Icon size={14} /> {estadoData.label}
          </span>
          <p className="text-xs uppercase tracking-widest text-slate-400">{etiquetaSaldo}</p>
          <p className="text-5xl md:text-6xl font-black tracking-tighter">
            ${valorSaldo}
          </p>
          {rentaMensual !== undefined && (
            <p className="text-sm text-slate-300 uppercase tracking-[0.2em]">
              Renta mensual: <span className="font-black text-white">${rentaMensual.toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>
      <div className="p-6 space-y-4">
        {ultimoPago && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
              Último pago
            </p>
            <p className="text-sm font-black text-slate-900">{ultimoPago}</p>
          </div>
        )}

        {notas && (
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 border border-slate-100">
            {notas}
          </div>
        )}

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-slate-400">
          <Clock3 size={14} /> Estado financiero actualizado en tiempo real
        </div>
      </div>
    </div>
  );
}
