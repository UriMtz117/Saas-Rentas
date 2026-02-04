"use client";
import { Printer, Share2 } from "lucide-react";

interface Props {
  nombreInquilino: string;
  monto: number;
}

export default function AccionesRecibo({ nombreInquilino, monto }: Props) {
  
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: "Comprobante de Pago - InmoGestion",
      text: `Hola ${nombreInquilino}, adjunto el recibo de tu pago por $${monto.toLocaleString()}.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Enlace copiado al portapapeles 📋");
      }
    } catch (err) {
      console.log("Error al compartir", err);
    }
  };

  return (
    <div className="border-t border-dashed border-slate-200 pt-10 flex flex-col gap-4 no-print">
      <button 
        onClick={handlePrint}
        className="w-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95"
      >
        <Printer size={18} /> Imprimir Recibo
      </button>
      
      <button 
        onClick={handleShare}
        className="w-full bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-400 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 border border-slate-100"
      >
        <Share2 size={18} /> Compartir Comprobante
      </button>
    </div>
  );
}