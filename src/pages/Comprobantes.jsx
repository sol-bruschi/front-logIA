import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Comprobantes() {
  const [comprobantes, setComprobantes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    numeroComprobante: '',
    tipoEntidad: 'proveedor', 
    entidadId: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resComp, resProv, resPlat] = await Promise.all([
        api.get('/comprobantes').catch(() => ({ data: [] })),
        api.get('/proveedores').catch(() => ({ data: [] })),
        api.get('/plataformas').catch(() => ({ data: [] })),
      ]);
      setComprobantes(resComp.data || []);
      setProveedores(resProv.data || []);
      setPlataformas(resPlat.data || []);
    } catch (error) {
      console.error('Error al cargar datos de comprobantes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const montoTotal = formData.items.reduce((acc, item) => {
    const cant = Number(item.cantidad) || 0;
    const precio = Number(item.precioUnitario) || 0;
    return acc + cant * precio;
  }, 0);

  const handleOpenModal = () => {
    const defaultEntidad = proveedores[0]?.proveedorId || proveedores[0]?.id || '';
    setFormData({
      numeroComprobante: '',
      tipoEntidad: 'proveedor',
      entidadId: defaultEntidad,
      fechaEmision: new Date().toISOString().split('T')[0],
      items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }],
    });
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { descripcion: '', cantidad: 1, precioUnitario: 0 }],
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.entidadId) {
      alert('Debes seleccionar un Proveedor o una Plataforma');
      return;
    }

    const numericEntidadId = Number(formData.entidadId);

    const payload = {
      numeroComprobante: formData.numeroComprobante,
      fechaEmision: formData.fechaEmision,
      montoTotal: montoTotal,
      proveedorId: formData.tipoEntidad === 'proveedor' ? numericEntidadId : null,
      plataformaId: formData.tipoEntidad === 'plataforma' ? numericEntidadId : null,
      items: formData.items.map((item) => ({
        descripcion: item.descripcion,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
      })),
    };

    try {
      await api.post('/comprobantes', payload);
      alert('Comprobante registrado con éxito');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar el comprobante:', error.response?.data || error.message);
      alert(error.response?.data?.error || error.response?.data?.message || 'Error al guardar el comprobante');
    }
  };

  return (
    <div className="p-8 bg-[#EFEFEF] min-h-screen font-sans text-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Comprobantes</h1>
          <p className="text-sm text-gray-500">Gestión e ingreso manual de facturas y remitos</p>
        </div>

        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-full shadow-md transition-all flex items-center gap-2"
        >
          <span>+</span> Carga Manual de Comprobante
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Carga Manual de Comprobante</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Número de Comprobante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroComprobante}
                    onChange={(e) => setFormData({ ...formData, numeroComprobante: e.target.value })}
                    placeholder="0001-00000291"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Entidad / Proveedor *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.tipoEntidad}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value;
                        const primeraOpcion = nuevoTipo === 'proveedor'
                          ? (proveedores[0]?.proveedorId || proveedores[0]?.id || '')
                          : (plataformas[0]?.plataformaId || plataformas[0]?.id || '');
                        setFormData({ ...formData, tipoEntidad: nuevoTipo, entidadId: primeraOpcion });
                      }}
                      className="p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                    >
                      <option value="proveedor">Proveedor</option>
                      <option value="plataforma">Plataforma</option>
                    </select>

                    <select
                      required
                      value={formData.entidadId}
                      onChange={(e) => setFormData({ ...formData, entidadId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      {formData.tipoEntidad === 'proveedor'
                        ? proveedores.map((p) => {
                            const id = p.proveedorId || p.id;
                            return <option key={id} value={id}>{p.proveedorRazonSocial}</option>;
                          })
                        : plataformas.map((p) => {
                            const id = p.plataformaId || p.id;
                            return <option key={id} value={id}>{p.plataformaNombre}</option>;
                          })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Fecha Emisión *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaEmision}
                    onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Monto Total (Calculado)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`$ ${montoTotal.toFixed(2)}`}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-100 text-sm font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase text-slate-600">
                    Detalle de Productos a Descontar/Ingresar
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + Agregar Ítem
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Descripción / Producto"
                        required
                        value={item.descripcion}
                        onChange={(e) => handleItemChange(idx, 'descripcion', e.target.value)}
                        className="flex-1 p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Cant."
                        min="1"
                        required
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                        className="w-20 p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none text-center"
                      />
                      <input
                        type="number"
                        placeholder="Precio U."
                        min="0"
                        step="0.01"
                        required
                        value={item.precioUnitario}
                        onChange={(e) => handleItemChange(idx, 'precioUnitario', e.target.value)}
                        className="w-28 p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
    </div>
  );
}