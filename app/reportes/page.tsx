"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Datos de ejemplo (Luego los puedes traer de la BD con un fetch)
const data = [
  { name: 'Ene', monto: 4000 },
  { name: 'Feb', monto: 3000 },
  { name: 'Mar', monto: 5000 },
  { name: 'Abr', monto: 4500 },
];

export default function ReportesPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-black mb-8">Reporte de Ingresos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border shadow-sm h-[400px]">
          <h2 className="font-bold mb-6 text-slate-500 uppercase text-xs tracking-widest">Ingresos Mensuales</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '15px', border:'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="monto" radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-center">
          <h3 className="text-4xl font-black mb-2 text-green-400">$16,500</h3>
          <p className="text-slate-400 font-medium">Recaudado este trimestre</p>
          <div className="mt-8 space-y-4">
             <div className="flex justify-between border-b border-slate-800 pb-2">
               <span>Ocupación</span>
               <span className="font-bold">85%</span>
             </div>
             <div className="flex justify-between border-b border-slate-800 pb-2">
               <span>Pagos al día</span>
               <span className="font-bold text-green-400">12</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}