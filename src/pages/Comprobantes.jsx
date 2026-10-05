import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Comprobantes() {
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState(null);

  const [manualForm, setManualForm] = useState({
    numeroComprobante: '',
    tipoOrigen: 'proveedor',
    entidadNombre: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    total: '',
    items: [{ productoNombre: '', cantidad: 1, precioUnitario: 0 }],
  });

  const fetchComprobantes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/comprobantes').catch(() => ({ data: [] }));
      setComprobantes(res.data || []);
    } catch (error) {
      console.error('Error cargando comprobantes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComprobantes();
  }, []);

  const handleAddItem = () => {
    setManualForm({
      ...manualForm,
      items: [...manualForm.items, { productoNombre: '', cantidad: 1, precioUnitario: 0 }],
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/comprobantes/manual', {
        ...manualForm,
        estado: 'CONFIRMADO', 
      });
      alert('Comprobante cargado exitosamente. Stock actualizado.');
      setIsManualModalOpen(false);
      fetchComprobantes();
    } catch (error) {
      console.error('Error en carga manual:', error);
      alert('Error al procesar el comprobante manual');
    }
  };

  const handleAprobarPendiente = async (id) => {
    try {
      await api.patch(`/comprobantes/${id}/aprobar`);
      alert('Comprobante verificado y confirmado. Stock impactado correctamente.');
      setIsRevisionModalOpen(false);
      fetchComprobantes();
    } catch (error) {
      console.error('Error al aprobar comprobante:', error);
      alert('Error al confirmar el comprobante');
    }
  };

  const filteredComprobantes = comprobantes.filter((item) => {
    if (filtroEstado === 'PENDIENTE') return item.estado === 'PENDIENTE';
    if (filtroEstado === 'CONFIRMADO') return item.estado === 'CONFIRMADO';
    return true;
  });

  return (
    <div className="p-8 bg-[#EFEFEF] min-h-screen text-slate-800 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Comprobantes</h1>
          <p className="text-sm text-gray-500">
            Procesamiento manual e inteligente con control de stock automatizado
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all text-sm flex items-center gap-2"
          >
            <span>+</span> Carga Manual
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-300 pb-2">
        <button
          onClick={() => setFiltroEstado('TODOS')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            filtroEstado === 'TODOS'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroEstado('PENDIENTE')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-amber-500 text-white'
              : 'bg-white text-amber-700 hover:bg-amber-50'
          }`}
        >
          <span>⚠️</span> Pendientes de Revisión IA
        </button>
        <button
          onClick={() => setFiltroEstado('CONFIRMADO')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            filtroEstado === 'CONFIRMADO'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <span>✅</span> Confirmados (Stock Descontado)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando comprobantes...</div>
        ) : filteredComprobantes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No se encontraron comprobantes registrados en este filtro.
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-4">N° Comprobante</th>
                <th className="p-4">Origen / Entidad</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Método de Carga</th>
                <th className="p-4">Monto Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComprobantes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{c.numeroComprobante || 's/n'}</td>
                  <td className="p-4 text-gray-700">{c.entidadNombre}</td>
                  <td className="p-4 text-gray-500">{c.fechaEmision}</td>
                  <td className="p-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                      {c.metodoCarga === 'IA_MAIL' ? '🤖 Receptor IA Mail' : '✋ Manual'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">${c.total}</td>
                  <td className="p-4">
                    {c.estado === 'CONFIRMADO' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        ● Confirmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                        ▲ Requiere Revisión
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {c.estado === 'PENDIENTE' && (
                      <button
                        onClick={() => {
                          setSelectedComprobante(c);
                          setIsRevisionModalOpen(true);
                        }}
                        className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-3 rounded-lg shadow-sm transition-all"
                      >
                        Revisar y Confirmar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Carga Manual de Comprobante</h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Número de Comprobante *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.numeroComprobante}
                    onChange={(e) => setManualForm({ ...manualForm, numeroComprobante: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                    placeholder="Ej. FC-0001-00001234"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Nombre Entidad / Proveedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.entidadNombre}
                    onChange={(e) => setManualForm({ ...manualForm, entidadNombre: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                    placeholder="Ej. Distribuidora Mayorista"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Fecha Emisión</label>
                  <input
                    type="date"
                    value={manualForm.fechaEmision}
                    onChange={(e) => setManualForm({ ...manualForm, fechaEmision: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Monto Total *</label>
                  <input
                    type="number"
                    required
                    value={manualForm.total}
                    onChange={(e) => setManualForm({ ...manualForm, total: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase text-slate-600">
                    Detalle de Productos a Descontar/Ingresar
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Agregar Ítem
                  </button>
                </div>

                {manualForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      placeholder="Producto"
                      value={item.productoNombre}
                      onChange={(e) => {
                        const newItems = [...manualForm.items];
                        newItems[idx].productoNombre = e.target.value;
                        setManualForm({ ...manualForm, items: newItems });
                      }}
                      className="flex-1 p-2 rounded-xl border border-gray-300 text-xs focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Cant"
                      value={item.cantidad}
                      onChange={(e) => {
                        const newItems = [...manualForm.items];
                        newItems[idx].cantidad = parseInt(e.target.value) || 1;
                        setManualForm({ ...manualForm, items: newItems });
                      }}
                      className="w-20 p-2 rounded-xl border border-gray-300 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Confirmar e Impactar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRevisionModalOpen && selectedComprobante && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-slate-900">Revisión de Comprobante (IA)</h3>
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl mb-4 border border-amber-200">
              ⚠️ La IA detectó inconsistencias o parámetros faltantes en este archivo de correo. Verifique los datos antes de descontar stock.
            </p>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">N° Comprobante:</span>
                <span className="font-bold">{selectedComprobante.numeroComprobante || 'Incompleto'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Origen / Emisor:</span>
                <span className="font-bold">{selectedComprobante.entidadNombre}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Monto Total:</span>
                <span className="font-bold">${selectedComprobante.total}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleAprobarPendiente(selectedComprobante.id)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
              >
                Aprobar y Descontar Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}