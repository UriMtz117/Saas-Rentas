"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export default function CarruselPremium({ fotos }: { fotos: string[] }) {
  const [index, setIndex] = useState(0);

  if (!fotos || fotos.length === 0) {
    return (
      <div className="h-[400px] md:h-[500px] bg-slate-100 rounded-[60px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed">
        <ImageIcon size={64} />
        <p className="font-black uppercase text-xs mt-4 tracking-widest">Sin imágenes en el expediente</p>
      </div>
    );
  }

  const next = () => setIndex((prev) => (prev + 1) % fotos.length);
  const prev = () => setIndex((prev) => (prev - 1 + fotos.length) % fotos.length);

  return (
    <div className="relative h-[400px] md:h-[500px] w-full rounded-[60px] overflow-hidden shadow-2xl group border-4 border-white">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={fotos[index]}
          initial={{ opacity: 0, x: 100, scale: 1.1 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          transition={{ duration: 0.6, ease: "anticipate" }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* EVENTOS DEL MOUSE: Botones que aparecen en hover */}
      {fotos.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900/40 backdrop-blur-md p-4 rounded-full text-white hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 bg-slate-900/40 backdrop-blur-md p-4 rounded-full text-white hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20">
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {fotos.map((_, i) => (
              <motion.div 
                key={i} 
                animate={{ width: i === index ? 30 : 8, backgroundColor: i === index ? "#3b82f6" : "rgba(255,255,255,0.5)" }}
                className="h-2 rounded-full cursor-pointer" 
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}