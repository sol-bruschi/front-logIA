import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ContextosIA() {
  const [contextos, setContextos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombrePlantilla: '',
    tipoEntidad: 'proveedor', 
    entidadId: '',
    instruccionesIA: '',
    archivoMuestra: null,
    camposCabecera: {
      fechaEmision: true,
      numeroComprobante: true,
      cuitEmisor: true,
      total: true,
    },
    camposDetalle: {
      nombreProducto: true,
      talle: true,
      color: false,
      cantidad: true,
      precioUnitario: true,
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resContextos, resProv, resPlat] = await Promise.all([
        api.get('/contextos-ia').catch(() => ({ data: [] })),
        api.get('/proveedores').catch(() => ({ data: [] })),
        api.get('/plataformas').catch(() => ({ data: [] })),
      ]);
      setContextos(resContextos.data || []);
      setProveedores(resProv.data || []);
      setPlataformas(resPlat.data || []);
    } catch (error) {
      console.error('Error cargando datos de Contextos IA:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (ctx = null) => {
    if (ctx) {
      setEditingId(ctx.id || ctx.contextoIaId);
      
      let parsedMapeo = {};
      if (ctx.mapeoCampo) {
        try {
          parsedMapeo = typeof ctx.mapeoCampo === 'string' ? JSON.parse(ctx.mapeoCampo) : ctx.mapeoCampo;
        } catch (e) {
          console.error("Error parseando mapeoCampo:", e);
        }
      }

      const esProv = Boolean(ctx.proveedorId);
      setFormData({
        nombrePlantilla: parsedMapeo.nombrePlantilla || ctx.nombrePlantilla || '',
        tipoEntidad: esProv ? 'proveedor' : 'plataforma',
        entidadId: ctx.proveedorId || ctx.plataformaId || '',
        instruccionesIA: parsedMapeo.instruccionesIA || ctx.instruccionesIA || '',
        archivoMuestra: null,
        camposCabecera: parsedMapeo.camposCabecera || { fechaEmision: true, numeroComprobante: true, cuitEmisor: true, total: true },
        camposDetalle: parsedMapeo.camposDetalle || { nombreProducto: true, talle: true, color: false, cantidad: true, precioUnitario: true },
      });
    } else {
      setEditingId(null);
      const defaultEntidadId = proveedores[0]?.proveedorId || proveedores[0]?.id || '';
      setFormData({
        nombrePlantilla: '',
        tipoEntidad: 'proveedor',
        entidadId: defaultEntidadId,
        instruccionesIA: '',
        archivoMuestra: null,
        camposCabecera: { fechaEmision: true, numeroComprobante: true, cuitEmisor: true, total: true },
        camposDetalle: { nombreProducto: true, talle: true, color: false, cantidad: true, precioUnitario: true },
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

    if (!formData.entidadId) {
      alert('Por favor selecciona una entidad (Proveedor o Plataforma)');
      return;
    }

    const numericId = Number(formData.entidadId);

    const mapeoEstructura = {
      nombrePlantilla: formData.nombrePlantilla,
      instruccionesIA: formData.instruccionesIA,
      camposCabecera: formData.camposCabecera,
      camposDetalle: formData.camposDetalle,
    };

    const payload = {
      proveedorId: formData.tipoEntidad === 'proveedor' ? numericId : null,
      plataformaId: formData.tipoEntidad === 'plataforma' ? numericId : null,
      mapeoCampo: JSON.stringify(mapeoEstructura),
      archivoEjemplo: formData.archivoMuestra ? formData.archivoMuestra.name : null,
    };

    try {
      if (editingId) {
        await api.put(`/contextos-ia/${editingId}`, payload);
      } else {
        await api.post('/contextos-ia', payload);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar plantilla de contexto:', error.response?.data || error.message);
      alert('Error al guardar la plantilla: ' + (error.response?.data?.error || 'Verifica los datos enviados'));
    }
  };

  return (
    <div className="p-8 bg-[#EFEFEF] min-h-screen text-slate-800 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contextos IA</h1>
          <p className="text-sm text-gray-500">Mapeo de reglas, documentos de muestra y etiquetas para la extracción automática</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <span>+</span> Nueva Plantilla IA
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Cargando plantillas de contexto...</div>
      ) : contextos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-sm">
          <p className="text-gray-400 mb-4">No hay plantillas de contexto IA configuradas.</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-blue-600 font-semibold text-sm hover:underline"
          >
            Crear la primera plantilla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contextos.map((ctx) => {
            let parsedMapeo = {};
            if (ctx.mapeoCampo) {
              try {
                parsedMapeo = typeof ctx.mapeoCampo === 'string' ? JSON.parse(ctx.mapeoCampo) : ctx.mapeoCampo;
              } catch (e) {}
            }
            const titulo = parsedMapeo.nombrePlantilla || `Plantilla #${ctx.id || ctx.contextoIaId}`;
            const tipo = ctx.proveedorId ? 'Proveedor' : 'Plataforma';

            return (
              <div key={ctx.id || ctx.contextoIaId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                      {tipo}
                    </span>
                    <button onClick={() => handleOpenModal(ctx)} className="text-gray-400 hover:text-slate-700 text-sm">✏️</button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{titulo}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-4">
                    {parsedMapeo.instruccionesIA || ctx.instruccionesIA || 'Sin reglas especiales de extracción.'}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-3 text-xs text-gray-400 flex justify-between items-center">
                  <span>📄 {ctx.archivoEjemplo || 'Sin muestra subida'}</span>
                  <span className="font-medium text-emerald-600">Activo</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8">
            <h3 className="text-xl font-bold mb-4 text-slate-900">
              {editingId ? 'Editar Plantilla de Contexto IA' : 'Nueva Plantilla de Contexto IA'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Nombre de la Plantilla *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombrePlantilla}
                    onChange={(e) => setFormData({ ...formData, nombrePlantilla: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Ej. Formato Factura A Standard"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Entidad Asociada *
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
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Datos de Cabecera Requeridos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl">
                  {Object.keys(formData.camposCabecera).map((key) => (
                    <label key={key} className="flex items-center gap-2 text-xs text-slate-700 capitalize cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.camposCabecera[key]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            camposCabecera: { ...formData.camposCabecera, [key]: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Datos de Detalle Requeridos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl">
                  {Object.keys(formData.camposDetalle).map((key) => (
                    <label key={key} className="flex items-center gap-2 text-xs text-slate-700 capitalize cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.camposDetalle[key]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            camposDetalle: { ...formData.camposDetalle, [key]: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Documento Digital de Muestra (PDF, JPG, PNG)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={(e) => setFormData({ ...formData, archivoMuestra: e.target.files[0] })}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Reglas de extracción / Instrucciones para la IA
                </label>
                <textarea
                  rows="3"
                  value={formData.instruccionesIA}
                  onChange={(e) => setFormData({ ...formData, instruccionesIA: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Ej. El número de factura se encuentra arriba a la derecha. El detalle del IVA no debe sumarse como producto."
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
                  Guardar Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}