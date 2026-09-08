import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Save, 
  FileText, 
  Building2,
  HardDrive,
  Folder,
  ShieldCheck, 
  Calendar, 
  Tag, 
  Paperclip, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  MapPin,
  TrendingUp,
  Percent,
  Layers
} from 'lucide-react';
import { EvaluacionGIT, AttachedDocument, EstatusProyecto } from '../types';
import { formatQuetzales, getModalidadCompraByMonto } from '../utils/formatters';
import { MINISTERIOS_GUATEMALA, getMinisterioBySiglas } from '../data/ministeriosData';

const formatF56eInput = (raw: string): string => raw.slice(0, 10);
const formatF56Input = (raw: string): string => raw.slice(0, 6);

const formatMontoMask = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const PurchaseFormModal: React.FC = () => {
  const { 
    isPurchaseModalOpen, 
    setIsPurchaseModalOpen, 
    purchaseToEdit, 
    setPurchaseToEdit,
    addPurchase, 
    updatePurchase, 
    catalogs 
  } = useApp();

  // Estados del Proyecto / Adquisición
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [siglasMinisterio, setSiglasMinisterio] = useState('CIV');
  const [ministerio, setMinisterio] = useState('Ministerio de Comunicaciones, Infraestructura y Vivienda');
  const [unidadEjecutora, setUnidadEjecutora] = useState('Dirección General de Caminos');
  const [estatus, setEstatus] = useState<EstatusProyecto>('En Ejecución');
  
  // Presupuestos y Avances
  const [monto, setMonto] = useState<number | ''>('');
  const [montoInput, setMontoInput] = useState<string>('');
  const [presupuestoEjecutado, setPresupuestoEjecutado] = useState<number | ''>('');
  const [avanceFisico, setAvanceFisico] = useState<number>(30);
  const [avanceFinanciero, setAvanceFinanciero] = useState<number>(25);

  // Google Drive
  const [googleDriveFolderUrl, setGoogleDriveFolderUrl] = useState('');

  // Identificadores y Datos Institucionales
  const [f56e, setF56e] = useState('');
  const [f56, setF56] = useState('');
  const [f56Documento, setF56Documento] = useState<AttachedDocument | null>(null);
  const [nog, setNog] = useState('');
  const [fechaSolicitud, setFechaSolicitud] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFinalizacionEstimada, setFechaFinalizacionEstimada] = useState('');
  const [responsable, setResponsable] = useState('');
  const [contactoResponsable, setContactoResponsable] = useState('');
  const [departamento, setDepartamento] = useState('Guatemala');
  const [modalidadCompra, setModalidadCompra] = useState('Licitación Pública');
  const [proveedorAdjudicado, setProveedorAdjudicado] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sincronizar selección de ministerio
  const handleMinistryChange = (siglas: string) => {
    setSiglasMinisterio(siglas);
    const min = getMinisterioBySiglas(siglas);
    if (min) {
      setMinisterio(min.nombre);
    }
  };

  useEffect(() => {
    if (purchaseToEdit) {
      setNombre(purchaseToEdit.nombre || purchaseToEdit.descripcion || '');
      setCodigo(purchaseToEdit.codigo || purchaseToEdit.f56e || '');
      setDescripcion(purchaseToEdit.descripcion || '');
      setSiglasMinisterio(purchaseToEdit.siglasMinisterio || 'CIV');
      setMinisterio(purchaseToEdit.ministerio || 'Ministerio de Comunicaciones, Infraestructura y Vivienda');
      setUnidadEjecutora(purchaseToEdit.unidadEjecutora || '');
      setEstatus((purchaseToEdit.estatus as EstatusProyecto) || 'En Ejecución');
      
      const pMonto = purchaseToEdit.presupuestoAsignado || purchaseToEdit.monto || '';
      setMonto(pMonto);
      setMontoInput(pMonto !== '' ? formatMontoMask(pMonto) : '');
      setPresupuestoEjecutado(purchaseToEdit.presupuestoEjecutado || '');
      setAvanceFisico(purchaseToEdit.avanceFisico !== undefined ? purchaseToEdit.avanceFisico : 50);
      setAvanceFinanciero(purchaseToEdit.avanceFinanciero !== undefined ? purchaseToEdit.avanceFinanciero : 45);
      
      setGoogleDriveFolderUrl(purchaseToEdit.googleDriveFolderUrl || `https://drive.google.com/drive/folders/alianzas-${purchaseToEdit.id}`);
      setF56e(purchaseToEdit.f56e || '');
      setF56(purchaseToEdit.f56 || '');
      setF56Documento(purchaseToEdit.f56Documento || null);
      setNog(purchaseToEdit.nog || '');
      setFechaSolicitud(purchaseToEdit.fechaSolicitud || '');
      setFechaInicio(purchaseToEdit.fechaInicio || purchaseToEdit.fechaSolicitud || '');
      setFechaFinalizacionEstimada(purchaseToEdit.fechaFinalizacionEstimada || '');
      setResponsable(purchaseToEdit.responsable || '');
      setContactoResponsable(purchaseToEdit.contactoResponsable || '');
      setDepartamento(purchaseToEdit.departamento || 'Guatemala');
      setModalidadCompra(purchaseToEdit.modalidadCompra || 'Licitación Pública');
      setProveedorAdjudicado(purchaseToEdit.proveedorAdjudicado || '');
      setObservaciones(purchaseToEdit.observaciones || '');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setNombre('');
      setCodigo(`PRJ-CIV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setDescripcion('');
      setSiglasMinisterio('CIV');
      setMinisterio('Ministerio de Comunicaciones, Infraestructura y Vivienda');
      setUnidadEjecutora('Dirección General de Caminos');
      setEstatus('En Ejecución');
      setMonto('');
      setMontoInput('');
      setPresupuestoEjecutado('');
      setAvanceFisico(15);
      setAvanceFinanciero(10);
      setGoogleDriveFolderUrl('https://drive.google.com/drive/folders/alianzas-nuevo-proyecto');
      setF56e('');
      setF56('');
      setF56Documento(null);
      setNog('');
      setFechaSolicitud(today);
      setFechaInicio(today);
      setFechaFinalizacionEstimada('');
      setResponsable('');
      setContactoResponsable('');
      setDepartamento('Guatemala');
      setModalidadCompra('Licitación Pública');
      setProveedorAdjudicado('');
      setObservaciones('');
    }
    setErrors({});
  }, [purchaseToEdit, isPurchaseModalOpen]);

  const handleMontoBlur = () => {
    if (montoInput.trim() === '') {
      setMonto('');
      return;
    }
    const clean = montoInput.replace(/,/g, '');
    const num = parseFloat(clean);
    if (!isNaN(num)) {
      setMonto(num);
      setMontoInput(formatMontoMask(num));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 750 * 1024) {
      alert('El archivo excede el límite máximo de 750 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setF56Documento({
        nombre: file.name,
        tamano: file.size,
        tipo: file.type || 'application/pdf',
        fechaSubida: new Date().toISOString(),
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nombre.trim() && !descripcion.trim()) {
      errs.nombre = 'El nombre o descripción del proyecto es obligatorio.';
    }
    if (monto === '' || isNaN(Number(monto)) || Number(monto) <= 0) {
      errs.monto = 'Ingrese un monto presupuestario válido en Quetzales mayor a 0.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const assignedBudget = Number(monto);
    const executedBudget = presupuestoEjecutado !== '' ? Number(presupuestoEjecutado) : (assignedBudget * (avanceFinanciero / 100));

    const recordData = {
      nombre: (nombre.trim() || descripcion.trim()),
      codigo: codigo.trim() || f56e.trim() || `PRJ-${siglasMinisterio}-${Date.now().toString().slice(-4)}`,
      descripcion: (descripcion.trim() || nombre.trim()),
      ministerio,
      siglasMinisterio,
      unidadEjecutora: unidadEjecutora.trim() || 'Dirección de Infraestructura',
      estatus,
      presupuestoAsignado: assignedBudget,
      presupuestoEjecutado: executedBudget,
      avanceFisico: Number(avanceFisico),
      avanceFinanciero: Number(avanceFinanciero),
      googleDriveFolderUrl: googleDriveFolderUrl.trim() || `https://drive.google.com/drive/folders/alianzas-${Date.now()}`,
      documentosDrive: purchaseToEdit?.documentosDrive || [],
      fechaInicio: fechaInicio || fechaSolicitud || new Date().toISOString().slice(0, 10),
      fechaFinalizacionEstimada: fechaFinalizacionEstimada || '',
      responsable: responsable.trim() || 'Director General de Proyecto',
      contactoResponsable: contactoResponsable.trim() || undefined,
      departamento: departamento || 'Guatemala',
      modalidadCompra,
      proveedorAdjudicado: proveedorAdjudicado.trim() || undefined,
      observaciones: observaciones.trim() || undefined,

      // Retrocompatibilidad
      monto: assignedBudget,
      f56e: f56e.trim() || codigo.trim(),
      f56: f56.trim() || undefined,
      f56Documento: f56Documento || undefined,
      nog: nog.trim() || '21948201',
      fechaSolicitud: fechaSolicitud || fechaInicio || new Date().toISOString().slice(0, 10),
      estatusEvento: estatus === 'En Ejecución' ? 'Evaluación' : estatus === 'Finalizado' ? 'Adjudicación' : 'Evaluación',
    };

    setTimeout(() => {
      if (purchaseToEdit) {
        updatePurchase(purchaseToEdit.id, recordData);
      } else {
        addPurchase(recordData);
      }
      setIsSubmitting(false);
      setIsPurchaseModalOpen(false);
      setPurchaseToEdit(null);
    }, 200);
  };

  if (!isPurchaseModalOpen) return null;

  const currentMinistryObj = getMinisterioBySiglas(siglasMinisterio);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Cabecera Oficial FIRME */}
        <div className="bg-gradient-to-r from-[#180407] via-[#350910] to-[#180407] p-4 sm:p-5 text-white flex items-center justify-between border-b border-[#4c0b14]">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20 flex-shrink-0"
              style={{ backgroundColor: currentMinistryObj ? currentMinistryObj.color : '#8B0000' }}
            >
              {siglasMinisterio}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                  Alianzas Estratégicas - FIRME
                </span>
                <span className="text-xs text-red-200">
                  • {purchaseToEdit ? 'Editar Proyecto' : 'Nuevo Registro'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Ficha de Control de Proyecto Ministerial
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsPurchaseModalOpen(false);
              setPurchaseToEdit(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-800">
          
          {/* SECCIÓN 1: SELECCIÓN DEL MINISTERIO DE GUATEMALA */}
          <div className="bg-red-50/50 p-4 rounded-xl border border-red-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-red-200/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-950 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-red-800" />
                <span>Ministerio de Gobierno de Guatemala</span>
              </span>
              <span className="text-[10px] font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded">
                14 Ministerios Oficiales
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Cartera Ministerial <span className="text-rose-600">*</span>
                </label>
                <select
                  value={siglasMinisterio}
                  onChange={(e) => handleMinistryChange(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {MINISTERIOS_GUATEMALA.map(m => (
                    <option key={m.id} value={m.siglas}>
                      {m.siglas} — {m.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Titular: <strong>{currentMinistryObj?.ministro}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Unidad Ejecutora / Dirección Responsable
                </label>
                <input
                  type="text"
                  value={unidadEjecutora}
                  onChange={(e) => setUnidadEjecutora(e.target.value)}
                  placeholder="Ej: Dirección General de Caminos, UCEE, DGA..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL PROYECTO */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-red-800" />
                <span>Identificación y Alcance del Proyecto</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nombre del Proyecto / Obra <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Construcción Puente Vehicular Paso Ancho Km 142..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
                />
                {errors.nombre && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Código del Proyecto
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ej: PRJ-CIV-2026-001"
                  className="w-full p-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Descripción y Alcance Técnico
              </label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles sobre especificaciones técnicas, beneficiarios, kilometraje o alcance..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>
          </div>

          {/* SECCIÓN 3: CONTROL DE DOCUMENTOS EN GOOGLE DRIVE */}
          <div className="bg-red-50/40 p-4 rounded-xl border border-red-200 space-y-3">
            <div className="flex items-center justify-between border-b border-red-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-950 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-red-800" />
                <span>Control de Documentos en Google Drive</span>
              </span>
              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                Nube Colaborativa
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Enlace de la Carpeta en Google Drive
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={googleDriveFolderUrl}
                  onChange={(e) => setGoogleDriveFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="flex-1 p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                />
                {googleDriveFolderUrl && (
                  <a
                    href={googleDriveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-red-900 hover:bg-red-800 text-white flex items-center gap-1 cursor-pointer text-xs font-bold"
                  >
                    <Folder className="w-3.5 h-3.5 text-red-200" />
                    <span>Abrir</span>
                    <ExternalLink className="w-3 h-3 text-red-200" />
                  </a>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Permite a los supervisores acceder al expediente, contratos, planos y fianzas almacenados en Google Drive.
              </p>
            </div>
          </div>

          {/* SECCIÓN 4: PRESUPUESTO Y AVANCES (FÍSICO & FINANCIERO) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-red-800" />
                <span>Presupuesto y Fiscalización de Avance</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Presupuesto Asignado (Q) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Q</span>
                  <input
                    type="text"
                    value={montoInput}
                    onChange={(e) => setMontoInput(e.target.value)}
                    onBlur={handleMontoBlur}
                    placeholder="000,000.00"
                    className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                {errors.monto && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.monto}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Estatus del Proyecto
                </label>
                <select
                  value={estatus}
                  onChange={(e) => setEstatus(e.target.value as EstatusProyecto)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  <option value="Planificación">Planificación</option>
                  <option value="En Licitación">En Licitación</option>
                  <option value="En Ejecución">En Ejecución</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="En Liquidación">En Liquidación</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Modalidad de Compra
                </label>
                <select
                  value={modalidadCompra}
                  onChange={(e) => setModalidadCompra(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  <option value="Licitación Pública">Licitación Pública</option>
                  <option value="Cotización Pública">Cotización Pública</option>
                  <option value="Compra Directa">Compra Directa</option>
                  <option value="Contrato Abierto">Contrato Abierto</option>
                </select>
              </div>
            </div>

            {/* Sliders de Avance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Avance Físico de Obra:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{avanceFisico}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={avanceFisico}
                  onChange={(e) => setAvanceFisico(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Avance Financiero:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{avanceFinanciero}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={avanceFinanciero}
                  onChange={(e) => setAvanceFinanciero(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: FECHAS Y RESPONSABLES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Finalización Estimada
              </label>
              <input
                type="date"
                value={fechaFinalizacionEstimada}
                onChange={(e) => setFechaFinalizacionEstimada(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Departamento de Guatemala
              </label>
              <input
                type="text"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Ej: Guatemala, Escuintla, Petén..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>
          </div>

          {/* SECCIÓN 6: DATOS DE RETROCOMPATIBILIDAD (NOG, F56-e) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Registros de Contratación Pública (Guatecompras)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  NOG Guatecompras
                </label>
                <input
                  type="text"
                  value={nog}
                  onChange={(e) => setNog(e.target.value)}
                  placeholder="Ej: 21948201"
                  className="w-full p-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Formulario F56-e
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={f56e}
                  onChange={(e) => setF56e(formatF56eInput(e.target.value))}
                  placeholder="000000-0000"
                  className="w-full p-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Responsable / Director
                </label>
                <input
                  type="text"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  placeholder="Nombre del director de proyecto..."
                  className="w-full p-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Botones de Pie */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setIsPurchaseModalOpen(false);
              setPurchaseToEdit(null);
            }}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Guardando...' : purchaseToEdit ? 'Guardar Cambios' : 'Registrar Proyecto'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PurchaseFormModal;
