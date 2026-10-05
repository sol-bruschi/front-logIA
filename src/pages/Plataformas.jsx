import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Plataformas() {
  const [plataformas, setPlataformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    plataformaNombre: '',
    plataformaCuit: '',
    plataformaMail: '',
  });

  const fetchPlataformas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plataformas');
      setPlataformas(res.data);
    } catch (error) {
      console.error('Error al cargar plataformas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlataformas();
  }, []);

  const handleOpenModal = (plat = null) => {
    if (plat) {
      setEditingId(plat.plataformaId);
      setFormData({
        plataformaNombre: plat.plataformaNombre || '',
        plataformaCuit: plat.plataformaCuit || '',
        plataformaMail: plat.plataformaMail || '',
      });
    } else {
      setEditingId(null);
      setFormData({ plataformaNombre: '', plataformaCuit: '', plataformaMail: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/plataformas/${editingId}`, formData);
      } else {
        await api.post('/plataformas', formData);
      }
      fetchPlataformas();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar plataforma:', error.response?.data || error.message);
      alert('Error al guardar la plataforma de venta');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta plataforma?')) return;
    try {
      await api.delete(`/plataformas/${id}`);
      fetchPlataformas();
    } catch (error) {
      console.error('Error al eliminar plataforma:', error);
    }
  };

  const filteredPlataformas = plataformas.filter((p) =>
    p.plataformaNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.plataformaCuit?.includes(busqueda) ||
    p.plataformaMail?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#EFEFEF] min-h-screen text-slate-800 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Plataformas de Venta</h1>
          <p className="text-sm text-gray-500">Parametrización de orígenes de venta (Tiendanube, Mercado Libre, etc.)</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <span>+</span> Nueva Plataforma
        </button>
      </div>

      <div className="mb-6 relative w-72">
        <input
          type="text"
          placeholder="Buscar Plataforma, CUIT..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 bg-white text-sm focus:outline-none shadow-sm"
        />
        <span className="absolute right-3 top-2.5 text-gray-400 text-xs">🔍</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando plataformas...</div>
        ) : filteredPlataformas.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay plataformas registradas.</div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-4">Plataforma / Razón Social</th>
                <th className="p-4">CUIT / Id. Fiscal</th>
                <th className="p-4">Correo Autorizado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlataformas.map((plat) => (
                <tr key={plat.plataformaId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{plat.plataformaNombre}</td>
                  <td className="p-4 text-gray-600">{plat.plataformaCuit || '-'}</td>
                  <td className="p-4 text-gray-600">{plat.plataformaMail || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(plat)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(plat.plataformaId)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900">
              {editingId ? 'Editar Plataforma' : 'Nueva Plataforma'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nombre de la Plataforma / Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={formData.plataformaNombre}
                  onChange={(e) => setFormData({ ...formData, plataformaNombre: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Ej. Tiendanube / Mercado Libre"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  CUIT / Identificador Fiscal
                </label>
                <input
                  type="text"
                  value={formData.plataformaCuit}
                  onChange={(e) => setFormData({ ...formData, plataformaCuit: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="30-71234567-8"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Correo Electrónico Autorizado
                </label>
                <input
                  type="email"
                  value={formData.plataformaMail}
                  onChange={(e) => setFormData({ ...formData, plataformaMail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="ventas@tienda.com"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}