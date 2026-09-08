import React, { useState } from 'react';
import { 
  Folder, 
  ExternalLink, 
  Plus, 
  Trash2, 
  FileText, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  Search,
  FileCheck
} from 'lucide-react';
import { GoogleDriveDocument, TipoDocumentoDrive } from '../types';

interface GoogleDriveManagerProps {
  folderUrl: string;
  onUpdateFolderUrl?: (url: string) => void;
  documentos: GoogleDriveDocument[];
  onAddDocument?: (doc: Omit<GoogleDriveDocument, 'id'>) => void;
  onRemoveDocument?: (id: string) => void;
  readOnly?: boolean;
  projectCode?: string;
  projectName?: string;
}

const TIPOS_DOCUMENTO: TipoDocumentoDrive[] = [
  'Términos de Referencia',
  'Bases de Licitación',
  'Contrato Administrativo',
  'Planos Técnicos',
  'Dictamen Técnico',
  'Dictamen Financiero',
  'Informe Mensual de Avance',
  'Informe de Supervisión',
  'Fianza de Cumplimiento',
  'Acta de Recepción Definitiva',
  'Documentación General'
];

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  folderUrl,
  onUpdateFolderUrl,
  documentos = [],
  onAddDocument,
  onRemoveDocument,
  readOnly = false,
  projectCode = 'PROYECTO',
  projectName = ''
}) => {
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [docName, setDocName] = useState('');
  const [docTipo, setDocTipo] = useState<TipoDocumentoDrive>('Términos de Referencia');
  const [docUrl, setDocUrl] = useState('');
  const [docTamano, setDocTamano] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingFolderUrl, setEditingFolderUrl] = useState(false);
  const [tempFolderUrl, setTempFolderUrl] = useState(folderUrl);

  const isValidDriveUrl = (url: string) => {
    if (!url) return false;
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docUrl.trim()) return;

    if (onAddDocument) {
      onAddDocument({
        nombre: docName.trim(),
        tipo: docTipo,
        url: docUrl.trim(),
        fecha: new Date().toISOString().split('T')[0],
        tamano: docTamano.trim() || 'Variable',
        subidoPor: 'Alianzas Estratégicas FIRME'
      });
    }

    setDocName('');
    setDocUrl('');
    setDocTamano('');
    setIsAddingDoc(false);
  };

  const filteredDocs = documentos.filter(doc => {
    const matchesTipo = filterTipo === 'todos' || doc.tipo === filterTipo;
    const matchesSearch = !searchTerm || 
      doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTipo && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Encabezado Google Drive */}
      <div className="p-4 bg-gradient-to-r from-red-900 via-rose-900 to-red-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <HardDrive className="w-5 h-5 text-red-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                Control Documental en Google Drive
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/30 text-red-200 border border-red-400/30">
                Cloud Sync
              </span>
            </div>
            <p className="text-xs text-red-200/80">
              Expedientes oficiales, planos, contratos y dictámenes vinculados en la nube
            </p>
          </div>
        </div>

        {/* Botón Abrir Carpeta Principal */}
        {folderUrl && (
          <a
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-red-50 text-red-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
            title="Abrir carpeta raíz del proyecto en Google Drive"
          >
            <Folder className="w-4 h-4 text-red-700" />
            <span>Abrir Carpeta en Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5 text-red-600" />
          </a>
        )}
      </div>

      {/* Barra de Carpeta Raíz de Google Drive */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1">
              <Folder className="w-4 h-4 text-amber-600" />
              <span>Carpeta Principal del Proyecto:</span>
              {isValidDriveUrl(folderUrl) ? (
                <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Enlace válido de Google Drive
                </span>
              ) : (
                <span className="text-amber-700 font-medium text-[11px]">
                  (Enlace general de repositorio documental)
                </span>
              )}
            </div>

            {editingFolderUrl && !readOnly ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="url"
                  value={tempFolderUrl}
                  onChange={(e) => setTempFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateFolderUrl) onUpdateFolderUrl(tempFolderUrl);
                    setEditingFolderUrl(false);
                  }}
                  className="px-3 py-1.5 bg-red-800 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempFolderUrl(folderUrl);
                    setEditingFolderUrl(false);
                  }}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-700 font-mono truncate bg-white px-2.5 py-1 rounded border border-slate-200 flex-1">
                  {folderUrl || 'No se ha configurado el enlace de la carpeta de Google Drive.'}
                </p>
                {!readOnly && onUpdateFolderUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempFolderUrl(folderUrl);
                      setEditingFolderUrl(true);
                    }}
                    className="text-xs text-red-800 hover:text-red-900 font-bold underline cursor-pointer whitespace-nowrap"
                  >
                    Editar URL
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-500">
              {documentos.length} {documentos.length === 1 ? 'documento' : 'documentos'} registrados
            </span>
            {!readOnly && onAddDocument && (
              <button
                type="button"
                onClick={() => setIsAddingDoc(!isAddingDoc)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vincular Documento</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulario para Vincular Nuevo Documento en Google Drive */}
      {isAddingDoc && !readOnly && (
        <form onSubmit={handleSaveNewDoc} className="p-4 bg-red-50/60 border-b border-red-200 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-950 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-red-700" />
              <span>Vincular Nuevo Archivo o Expediente de Google Drive</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingDoc(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre del Documento o Expediente *
              </label>
              <input
                type="text"
                required
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Ej. Contrato Administrativo Firmado 2026.pdf"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Expediente *
              </label>
              <select
                value={docTipo}
                onChange={(e) => setDocTipo(e.target.value as TipoDocumentoDrive)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              >
                {TIPOS_DOCUMENTO.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enlace Directo de Google Drive * (docs.google.com o drive.google.com)
              </label>
              <input
                type="url"
                required
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tamaño Aprox. (Opcional)
              </label>
              <input
                type="text"
                value={docTamano}
                onChange={(e) => setDocTamano(e.target.value)}
                placeholder="Ej. 12.5 MB"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-200">
            <button
              type="button"
              onClick={() => setIsAddingDoc(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Guardar en Google Drive
            </button>
          </div>
        </form>
      )}

      {/* Filtros de Documentos */}
      {documentos.length > 0 && (
        <div className="p-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar documento en Drive..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Filtrar Tipo:
            </span>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-700"
            >
              <option value="todos">Todos los tipos ({documentos.length})</option>
              {TIPOS_DOCUMENTO.map(tipo => {
                const count = documentos.filter(d => d.tipo === tipo).length;
                if (count === 0) return null;
                return (
                  <option key={tipo} value={tipo}>
                    {tipo} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Lista de Documentos Vinculados */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <HardDrive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              {documentos.length === 0 
                ? 'No hay documentos vinculados en Google Drive para este proyecto.' 
                : 'No se encontraron documentos con el filtro aplicado.'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Utilice el botón "+ Vincular Documento" para agregar expedientes, planos o dictámenes técnicos.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="p-3 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {doc.nombre}
                    </h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.tipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    <span>Fecha: {doc.fecha}</span>
                    {doc.tamano && <span>• {doc.tamano}</span>}
                    {doc.subidoPor && <span>• {doc.subidoPor}</span>}
                  </div>
                </div>
              </div>

              {/* Botones de Acción para el Documento */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyLink(doc.url, doc.id)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200 text-xs font-medium cursor-pointer"
                  title="Copiar enlace de Google Drive"
                >
                  {copiedId === doc.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-900 border border-red-300 text-xs font-bold transition-all shadow-2xs hover:border-red-500 cursor-pointer"
                  title="Abrir directamente en Google Drive"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-red-700" />
                  <span>Abrir en Drive</span>
                </a>

                {!readOnly && onRemoveDocument && (
                  <button
                    type="button"
                    onClick={() => onRemoveDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    title="Desvincular documento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoogleDriveManager;
