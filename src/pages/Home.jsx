import React from 'react';

export default function Home() {
  return (
    <div className="p-8 bg-[#EFEFEF] min-h-screen text-slate-800 font-sans">
      {/* Encabezado superior */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">LogIA</h1>
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Buscar"
            className="w-full py-1.5 px-4 pr-10 rounded-full border border-gray-300 bg-white text-sm focus:outline-none shadow-sm"
          />
          <span className="absolute right-3 top-2 text-gray-400 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-right">
          <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
            👤
          </div>
          <div>
            <div className="font-bold text-slate-800">Sol</div>
            <div className="text-gray-500">Administrador</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800">Inicio</h2>

      <div className="w-full min-h-[400px] border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400">
        Área de contenido principal
      </div>
    </div>
  );
}