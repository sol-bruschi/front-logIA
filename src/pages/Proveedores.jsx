import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    proveedorRazonSocial: '',
    proveedorCUIT: '',
    proveedorMail: '',
  });

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/proveedores');
      setProveedores(res.data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleOpenModal = (prov = null) => {
    if (prov) {
      setEditingId(prov.proveedorId || prov.id);
      setFormData({
        proveedorRazonSocial: prov.proveedorRazonSocial || '',
        proveedorCUIT: prov.proveedorCUIT || prov.proveedorCuit || '',
        proveedorMail: prov.proveedorMail || '',
      });
    } else {
      setEditingId(null);
      setFormData({ proveedorRazonSocial: '', proveedorCUIT: '', proveedorMail: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      proveedorRazonSocial: formData.proveedorRazonSocial.trim(),
      proveedorCUIT: String(formData.proveedorCUIT).trim(),
      proveedorMail: formData.proveedorMail.trim(),
    };

    try {
      if (editingId) {
        await api.put(`/proveedores/${editingId}`, payload);
      } else {
        await api.post('/proveedores', payload);
      }
      fetchProveedores();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar proveedor:', error.response?.data || error.message);
      alert('Error al guardar los datos del proveedor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este proveedor?')) return;
    try {
      await api.delete(`/proveedores/${id}`);
      fetchProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
    }
  };

  const filteredProveedores = proveedores.filter((p) => {
    const cuit = p.proveedorCUIT || p.proveedorCuit || '';
    return (
      p.proveedorRazonSocial?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cuit.includes(busqueda) ||
      p.proveedorMail?.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  return (
    <div className="p-8 bg-[#EFEFEF] min-h-screen text-slate-800 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-sm text-gray-500">Parametrización y registro de entidades comerciales</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <span>+</span> Nuevo Proveedor
        </button>
      </div>

      <div className="mb-6 relative w-72">
        <input
          type="text"
          placeholder="Buscar Razón Social, CUIT..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 bg-white text-sm focus:outline-none shadow-sm"
        />
        <span className="absolute right-3 top-2.5 text-gray-400 text-xs">🔍</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando proveedores...</div>
        ) : filteredProveedores.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron proveedores registrados.</div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-4">Razón Social</th>
                <th className="p-4">CUIT / Id. Fiscal</th>
                <th className="p-4">Correo Autorizado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProveedores.map((prov) => {
                const provId = prov.proveedorId || prov.id;
                const provCuit = prov.proveedorCUIT || prov.proveedorCuit;
                return (
                  <tr key={provId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{prov.proveedorRazonSocial}</td>
                    <td className="p-4 text-gray-600">{provCuit || '-'}</td>
                    <td className="p-4 text-gray-600">{prov.proveedorMail || '-'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(prov)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(provId)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900">
              {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={formData.proveedorRazonSocial}
                  onChange={(e) => setFormData({ ...formData, proveedorRazonSocial: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Ej. Distribuidora Logística S.A."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  CUIT / Identificador Fiscal
                </label>
                <input
                  type="text"
                  required
                  value={formData.proveedorCUIT}
                  onChange={(e) => setFormData({ ...formData, proveedorCUIT: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="30-12345678-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Correo Electrónico Autorizado
                </label>
                <input
                  type="email"
                  required
                  value={formData.proveedorMail}
                  onChange={(e) => setFormData({ ...formData, proveedorMail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="facturacion@proveedor.com"
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