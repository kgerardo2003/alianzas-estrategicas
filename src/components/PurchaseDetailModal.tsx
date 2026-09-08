import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Printer, 
  Calendar, 
  FileText, 
  Edit,
  Download,
  Paperclip,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Building2,
  HardDrive,
  Folder,
  ExternalLink,
  User,
  MapPin,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { formatQuetzales, formatDate, formatDateTime, getModalidadCompraByMonto } from '../utils/formatters';
import { InstitutionalReportModal } from './InstitutionalReportModal';
import { GoogleDriveManager } from './GoogleDriveManager';
import { getMinisterioBySiglas } from '../data/ministeriosData';
import { GoogleDriveDocument } from '../types';

export const PurchaseDetailModal: React.FC = () => {
  const { 
    selectedPurchase, 
    setSelectedPurchase, 
    setIsPurchaseModalOpen, 
    setPurchaseToEdit,
    updatePurchase,
    deletePurchase,
    currentUser 
  } = useApp();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!selectedPurchase) return null;

  const canEdit = currentUser?.rol === 'administrador' || currentUser?.rol === 'usuario_estandar';
  const canDelete = currentUser?.rol === 'administrador' || currentUser?.rol === 'usuario_estandar';

  const minInfo = selectedPurchase.siglasMinisterio ? getMinisterioBySiglas(selectedPurchase.siglasMinisterio) : null;
  const projectCode = selectedPurchase.codigo || selectedPurchase.f56e || selectedPurchase.id;
  const projectName = selectedPurchase.nombre || selectedPurchase.descripcion;
  const asignado = selectedPurchase.presupuestoAsignado || selectedPurchase.monto || 0;
  const ejecutado = selectedPurchase.presupuestoEjecutado || (asignado * ((selectedPurchase.avanceFinanciero || 45) / 100));
  const avanceFisico = selectedPurchase.avanceFisico !== undefined ? selectedPurchase.avanceFisico : 50;
  const avanceFinanciero = selectedPurchase.avanceFinanciero !== undefined ? selectedPurchase.avanceFinanciero : 45;
  const folderUrl = selectedPurchase.googleDriveFolderUrl || `https://drive.google.com/drive/folders/alianzas-${selectedPurchase.id}`;
  const documentos = selectedPurchase.documentosDrive || [];

  const handleEditFromDetail = () => {
    setPurchaseToEdit(selectedPurchase);
    setSelectedPurchase(null);
    setIsPurchaseModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deletePurchase(selectedPurchase.id);
    setIsConfirmDeleteOpen(false);
    setSelectedPurchase(null);
  };

  // Agregar nuevo documento a Google Drive
  const handleAddDriveDoc = (newDoc: Omit<GoogleDriveDocument, 'id'>) => {
    const docWithId: GoogleDriveDocument = {
      ...newDoc,
      id: `gdoc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    };
    const updatedDocs = [...documentos, docWithId];
    const updatedRecord = {
      ...selectedPurchase,
      documentosDrive: updatedDocs
    };
    updatePurchase(selectedPurchase.id, updatedRecord);
    setSelectedPurchase(updatedRecord);
  };

  // Remover documento de Google Drive
  const handleRemoveDriveDoc = (docId: string) => {
    const updatedDocs = documentos.filter(d => d.id !== docId);
    const updatedRecord = {
      ...selectedPurchase,
      documentosDrive: updatedDocs
    };
    updatePurchase(selectedPurchase.id, updatedRecord);
    setSelectedPurchase(updatedRecord);
  };

  // Actualizar URL de la carpeta de Google Drive
  const handleUpdateFolderUrl = (newUrl: string) => {
    const updatedRecord = {
      ...selectedPurchase,
      googleDriveFolderUrl: newUrl
    };
    updatePurchase(selectedPurchase.id, updatedRecord);
    setSelectedPurchase(updatedRecord);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
          
          {/* Cabecera Oficial FIRME */}
          <div className="bg-gradient-to-r from-[#180407] via-[#350910] to-[#180407] p-4 sm:p-5 text-white flex items-center justify-between border-b border-[#4c0b14]">
            <div className="flex items-center space-x-3 min-w-0">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20 flex-shrink-0"
                style={{ backgroundColor: minInfo ? minInfo.color : '#8B0000' }}
              >
                {selectedPurchase.siglasMinisterio || 'CIV'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-red-300">
                    {projectCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                    {selectedPurchase.estatus || selectedPurchase.estatusEvento || 'En Ejecución'}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {projectName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                title="Generar Ficha Oficial Imprimible"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Boleta Oficial</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPurchase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenido con Scroll */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 text-xs sm:text-sm">
            
            {/* Banner Institucional del Ministerio */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <Building2 className="w-6 h-6 text-red-800" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Ministerio Responsable
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedPurchase.ministerio || minInfo?.nombre || 'Ministerio de Comunicaciones, Infraestructura y Vivienda'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    {minInfo?.ministro && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Titular: <strong>{minInfo.ministro}</strong></span>
                      </span>
                    )}
                    {selectedPurchase.unidadEjecutora && (
                      <span>• Unidad: <strong>{selectedPurchase.unidadEjecutora}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Enlace Directo a Carpeta de Google Drive */}
              {folderUrl && (
                <a
                  href={folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start md:self-center"
                >
                  <Folder className="w-4 h-4 text-red-200" />
                  <span>Abrir Carpeta Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5 text-red-200" />
                </a>
              )}
            </div>

            {/* Métricas Presupuestarias y Avances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Presupuesto Asignado
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                  {formatQuetzales(asignado)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Presupuesto Ejecutado
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                  {formatQuetzales(ejecutado)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Avance Físico</span>
                  <span className="text-emerald-700 font-bold">{avanceFisico}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${avanceFisico}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Avance Financiero</span>
                  <span className="text-blue-700 font-bold">{avanceFinanciero}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${avanceFinanciero}%` }} />
                </div>
              </div>
            </div>

            {/* Módulo de Control de Documentos Google Drive */}
            <GoogleDriveManager
              folderUrl={folderUrl}
              onUpdateFolderUrl={handleUpdateFolderUrl}
              documentos={documentos}
              onAddDocument={handleAddDriveDoc}
              onRemoveDocument={handleRemoveDriveDoc}
              readOnly={!canEdit}
              projectCode={projectCode}
              projectName={projectName}
            />

            {/* Alcance y Objetivos del Proyecto */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-red-800" />
                <span>Descripción y Alcance Técnico</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedPurchase.descripcion || selectedPurchase.nombre}
              </p>
            </div>

            {/* Datos Complementarios y Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Responsable / Coordinador
                </span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  {selectedPurchase.responsable || selectedPurchase.creadoPor || 'Director de Proyectos'}
                </span>
                {selectedPurchase.contactoResponsable && (
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {selectedPurchase.contactoResponsable}
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ubicación Geográfica
                </span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  {selectedPurchase.departamento || 'Guatemala'}
                </span>
                {selectedPurchase.municipio && (
                  <span className="text-[10px] text-slate-500 block">
                    {selectedPurchase.municipio}
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  NOG Guatecompras
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">
                  {selectedPurchase.nog || 'En Preparación'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Modalidad: {selectedPurchase.modalidadCompra || 'Licitación Pública'}
                </span>
              </div>
            </div>

          </div>

          {/* Pie del Modal con Acciones */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Proyecto</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cerrar
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={handleEditFromDetail}
                  className="px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar Proyecto</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900 mb-2">
              ¿Eliminar Proyecto Oficial?
            </h3>
            <p className="text-xs text-center text-slate-600 mb-6">
              Esta acción eliminará el proyecto <strong>{projectCode}</strong> y desvinculará sus registros en Firestore.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impresión de Boleta Oficial */}
      {isReportModalOpen && (
        <InstitutionalReportModal
          purchase={selectedPurchase}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </>
  );
};

export default PurchaseDetailModal;
