import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    razonSocial: '',
    cuit: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/proveedores');
      setProveedores(res.data || []);
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
      const id = prov.proveedorId || prov.id;
      setEditingId(id);
      setFormData({
        razonSocial: prov.proveedorRazonSocial || prov.razonSocial || '',
        cuit: prov.proveedorCuit || prov.cuit || '',
        email: prov.proveedorEmail || prov.email || '',
        telefono: prov.proveedorTelefono || prov.telefono || '',
        direccion: prov.proveedorDireccion || prov.direccion || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        razonSocial: '',
        cuit: '',
        email: '',
        telefono: '',
        direccion: '',
      });
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
      proveedorRazonSocial: formData.razonSocial.trim(),
      razonSocial: formData.razonSocial.trim(),
      proveedorCuit: formData.cuit.trim(),
      cuit: formData.cuit.trim(),
      proveedorEmail: formData.email.trim(),
      email: formData.email.trim(),
      proveedorTelefono: formData.telefono.trim(),
      telefono: formData.telefono.trim(),
      proveedorDireccion: formData.direccion.trim(),
      direccion: formData.direccion.trim(),
    };

    try {
      if (editingId) {
        await api.put(`/proveedores/${editingId}`, payload);
        alert('Proveedor actualizado con éxito');
      } else {
        await api.post('/proveedores', payload);
        alert('Proveedor registrado con éxito');
      }
      fetchProveedores();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar proveedor:', error.response?.data || error.message);
      alert('Error al guardar: ' + (error.response?.data?.message || error.response?.data?.error || 'Verifica los datos'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return;
    try {
      await api.delete(`/proveedores/${id}`);
      fetchProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      alert('No se pudo eliminar el proveedor');
    }
  };

  return (
    <div className="p-8 bg-[#EFEFEF] min-h-screen font-sans text-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-sm text-gray-500">Gestión de proveedores e información fiscal</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-full shadow-md transition-all flex items-center gap-2"
        >
          <span>+</span> Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando proveedores...</div>
        ) : proveedores.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay proveedores registrados.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="p-4">Razón Social</th>
                <th className="p-4">CUIT</th>
                <th className="p-4">Email</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {proveedores.map((p) => {
                const id = p.proveedorId || p.id;
                const razonSocial = p.proveedorRazonSocial || p.razonSocial;
                const cuit = p.proveedorCuit || p.cuit;
                const email = p.proveedorEmail || p.email;
                const telefono = p.proveedorTelefono || p.telefono;

                return (
                  <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{razonSocial}</td>
                    <td className="p-4 text-slate-600">{cuit || '-'}</td>
                    <td className="p-4 text-slate-600">{email || '-'}</td>
                    <td className="p-4 text-slate-600">{telefono || '-'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold text-xs"
                      >
                        Eliminar
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
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Ej. Distribuidora S.A."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  CUIT / Nro. Fiscal *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cuit}
                  onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Ej. 30-12345678-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="ventas@proveedor.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="11-4433-2211"
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
                  {editingId ? 'Guardar Cambios' : 'Crear Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}