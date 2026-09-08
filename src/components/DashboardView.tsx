import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Folder,
  HardDrive,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  Download,
  Search,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { MINISTERIOS_GUATEMALA, getMinisterioBySiglas } from '../data/ministeriosData';
import { formatQuetzales, formatDate, exportToCSV } from '../utils/formatters';
import { ProjectRecord } from '../types';

export const DashboardView: React.FC = () => {
  const { 
    purchases, 
    setSelectedPurchase, 
    setActiveTab, 
    setIsPurchaseModalOpen, 
    setPurchaseToEdit,
    themeConfig 
  } = useApp();

  const [selectedMinistryFilter, setSelectedMinistryFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTabSubView, setActiveTabSubView] = useState<'ministerios' | 'proyectos' | 'drive'>('ministerios');

  // Normalize project records
  const projects: ProjectRecord[] = useMemo(() => {
    return purchases.map(p => {
      const min = p.siglasMinisterio ? getMinisterioBySiglas(p.siglasMinisterio) : null;
      return {
        ...p,
        nombre: p.nombre || p.descripcion,
        codigo: p.codigo || p.f56e || p.id,
        presupuestoAsignado: p.presupuestoAsignado || p.monto || 0,
        presupuestoEjecutado: p.presupuestoEjecutado || ((p.monto || 0) * ((p.avanceFinanciero || 40) / 100)),
        ministerio: p.ministerio || (min ? min.nombre : 'Ministerio de Comunicaciones, Infraestructura y Vivienda'),
        siglasMinisterio: p.siglasMinisterio || (min ? min.siglas : 'CIV'),
        avanceFisico: p.avanceFisico !== undefined ? p.avanceFisico : 50,
        avanceFinanciero: p.avanceFinanciero !== undefined ? p.avanceFinanciero : 45,
        estatus: p.estatus || 'En Ejecución',
        googleDriveFolderUrl: p.googleDriveFolderUrl || `https://drive.google.com/drive/folders/alianzas-${p.id}`,
        documentosDrive: p.documentosDrive || []
      };
    });
  }, [purchases]);

  // Ministry statistics
  const ministryStats = useMemo(() => {
    return MINISTERIOS_GUATEMALA.map(min => {
      const minProjects = projects.filter(p => 
        p.siglasMinisterio === min.siglas || 
        (p.ministerio && p.ministerio.toLowerCase().includes(min.siglas.toLowerCase())) ||
        (p.ministerio && p.ministerio.toLowerCase() === min.nombre.toLowerCase())
      );

      const totalPresupuesto = minProjects.reduce((sum, p) => sum + (p.presupuestoAsignado || 0), 0);
      const totalEjecutado = minProjects.reduce((sum, p) => sum + (p.presupuestoEjecutado || 0), 0);
      const avgAvanceFisico = minProjects.length > 0 
        ? Math.round(minProjects.reduce((sum, p) => sum + (p.avanceFisico || 0), 0) / minProjects.length) 
        : 0;
      const avgAvanceFinanciero = minProjects.length > 0 
        ? Math.round(minProjects.reduce((sum, p) => sum + (p.avanceFinanciero || 0), 0) / minProjects.length) 
        : 0;
      const docsCount = minProjects.reduce((sum, p) => sum + (p.documentosDrive ? p.documentosDrive.length : 0), 0);

      return {
        ...min,
        projectCount: minProjects.length,
        totalPresupuesto,
        totalEjecutado,
        avgAvanceFisico,
        avgAvanceFinanciero,
        docsCount,
        projects: minProjects
      };
    });
  }, [projects]);

  // Global KPIs
  const globalKPIs = useMemo(() => {
    const totalProjects = projects.length;
    const totalPresupuesto = projects.reduce((acc, p) => acc + (p.presupuestoAsignado || 0), 0);
    const totalEjecutado = projects.reduce((acc, p) => acc + (p.presupuestoEjecutado || 0), 0);
    const totalDriveDocs = projects.reduce((acc, p) => acc + (p.documentosDrive ? p.documentosDrive.length : 0), 0);
    const avgPhysical = totalProjects > 0 
      ? Math.round(projects.reduce((acc, p) => acc + (p.avanceFisico || 0), 0) / totalProjects) 
      : 0;
    const avgFinancial = totalProjects > 0 
      ? Math.round(projects.reduce((acc, p) => acc + (p.avanceFinanciero || 0), 0) / totalProjects) 
      : 0;
    const activeMinistriesCount = ministryStats.filter(m => m.projectCount > 0).length;

    return {
      totalProjects,
      totalPresupuesto,
      totalEjecutado,
      totalDriveDocs,
      avgPhysical,
      avgFinancial,
      activeMinistriesCount
    };
  }, [projects, ministryStats]);

  // Bar Chart Data (Presupuesto por Ministerio)
  const barChartData = useMemo(() => {
    return ministryStats
      .filter(m => m.projectCount > 0)
      .map(m => ({
        name: m.siglas,
        nombreCompleto: m.nombre,
        color: m.color,
        presupuesto: m.totalPresupuesto,
        ejecutado: m.totalEjecutado,
        proyectos: m.projectCount,
        avanceFisico: m.avgAvanceFisico
      }))
      .sort((a, b) => b.presupuesto - a.presupuesto);
  }, [ministryStats]);

  // Donut Chart Data (Participación Presupuestaria)
  const donutChartData = useMemo(() => {
    return ministryStats
      .filter(m => m.totalPresupuesto > 0)
      .map(m => ({
        name: m.siglas,
        value: m.totalPresupuesto,
        color: m.color
      }))
      .sort((a, b) => b.value - a.value);
  }, [ministryStats]);

  // Filtered project list
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesMinistry = selectedMinistryFilter === 'todos' || 
        p.siglasMinisterio === selectedMinistryFilter ||
        (p.ministerio && p.ministerio.toLowerCase().includes(selectedMinistryFilter.toLowerCase()));
      const matchesSearch = !searchTerm ||
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.ministerio && p.ministerio.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesMinistry && matchesSearch;
    });
  }, [projects, selectedMinistryFilter, searchTerm]);

  const handleExportCSV = () => {
    const dataToExport = filteredProjects.map(p => ({
      'Código': p.codigo,
      'Proyecto': p.nombre,
      'Ministerio': p.ministerio,
      'Siglas': p.siglasMinisterio,
      'Estatus': p.estatus,
      'Presupuesto Asignado': p.presupuestoAsignado,
      'Presupuesto Ejecutado': p.presupuestoEjecutado,
      'Avance Físico (%)': p.avanceFisico,
      'Avance Financiero (%)': p.avanceFinanciero,
      'Carpeta Drive': p.googleDriveFolderUrl || 'N/A'
    }));
    exportToCSV(dataToExport, `Reporte_Proyectos_Ministeriales_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Banner Oficial - Alianzas Estratégicas FIRME */}
      <div className="bg-gradient-to-r from-[#180407] via-[#350910] to-[#180407] rounded-2xl p-6 text-white border border-[#4c0b14] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600 text-white border border-red-400/40 shadow-sm">
                Alianzas Estratégicas - FIRME
              </span>
              <span className="text-xs text-red-200/80 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>Gobierno de Guatemala • Control Interministerial</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
              Sistema de Control de Proyectos
            </h1>
            <p className="text-xs sm:text-sm text-red-100/80 max-w-3xl leading-relaxed">
              Supervisión de obras, fiscalización física y financiera, expedientes enlazados en Google Drive y análisis estadístico en todos los Ministerios de la República.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer backdrop-blur-xs shadow-xs"
            >
              <Download className="w-4 h-4 text-red-300" />
              <span>Exportar CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPurchaseToEdit(null);
                setIsPurchaseModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer border border-red-400/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nuevo Proyecto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Superiores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Proyectos Totales */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Proyectos Registrados
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {globalKPIs.totalProjects}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              en {globalKPIs.activeMinistriesCount} ministerios
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Monitoreo en tiempo real</span>
          </div>
        </div>

        {/* Presupuesto Asignado */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Presupuesto Asignado
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {formatQuetzales(globalKPIs.totalPresupuesto)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Ejecutado: <strong className="text-slate-800">{formatQuetzales(globalKPIs.totalEjecutado)}</strong>
          </div>
        </div>

        {/* Avance Físico / Financiero */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Avance Físico / Financiero
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {globalKPIs.avgPhysical}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              físico • {globalKPIs.avgFinancial}% financiero
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div 
              className="bg-red-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${globalKPIs.avgPhysical}%` }} 
            />
          </div>
        </div>

        {/* Google Drive Documentos */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Documentos en Google Drive
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-900 flex items-center justify-center font-bold">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-950 font-mono">
              {globalKPIs.totalDriveDocs}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              expedientes activos
            </span>
          </div>
          <div className="mt-2 text-[11px] text-red-700 font-bold flex items-center gap-1">
            <Folder className="w-3.5 h-3.5 text-amber-600" />
            <span>Enlace Cloud Activo</span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas de Vista Rápida */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabSubView('ministerios')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabSubView === 'ministerios'
                ? 'bg-red-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Estadísticas por Ministerio ({MINISTERIOS_GUATEMALA.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSubView('proyectos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabSubView === 'proyectos'
                ? 'bg-red-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Listado de Proyectos ({projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSubView('drive')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabSubView === 'drive'
                ? 'bg-red-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Control Google Drive</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('compras')}
          className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center gap-1 cursor-pointer"
        >
          <span>Ir a Gestión de Proyectos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SUB-VISTA 1: ESTADÍSTICAS POR MINISTERIO */}
      {activeTabSubView === 'ministerios' && (
        <div className="space-y-6">
          {/* Gráficas de Inversión y Distribución */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfica de Barras por Ministerio */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-red-700" />
                    <span>Presupuesto Asignado vs Ejecutado por Ministerio</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Comparación en Quetzales (Q) para carteras ministeriales con proyectos
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }} 
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(val) => {
                        if (val >= 1000000) return `Q${(val/1000000).toFixed(1)}M`;
                        if (val >= 1000) return `Q${(val/1000).toFixed(0)}k`;
                        return `Q${val}`;
                      }}
                    />
                    <Tooltip 
                      formatter={(val: any, name: string) => [formatQuetzales(Number(val)), name]}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload;
                        return item?.nombreCompleto || label;
                      }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="presupuesto" name="Presupuesto Asignado" fill="#8B0000" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ejecutado" name="Presupuesto Ejecutado" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfica Circular de Participación Presupuestaria */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-red-700" />
                  <span>Distribución Presupuestaria</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Participación por Ministerio
                </p>
              </div>

              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutChartData.map((entry, index) => (
                        <Cell key={`donut-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [formatQuetzales(Number(val)), 'Presupuesto']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400">Total</span>
                  <span className="text-xs font-black text-slate-900 font-mono">
                    {formatQuetzales(globalKPIs.totalPresupuesto).split('.')[0]}
                  </span>
                </div>
              </div>

              {/* Lista Rápida de Ministerios */}
              <div className="space-y-1 max-h-28 overflow-y-auto pt-2 border-t border-slate-100 text-[11px]">
                {donutChartData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-600">{formatQuetzales(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de los 14 Ministerios de Guatemala */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-red-800" />
                  <span>Los 14 Ministerios de Gobierno de Guatemala</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Desglose oficial de proyectos, titulares de cartera y expedientes en Google Drive
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-900 border border-red-200">
                100% Ministerios Activos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {ministryStats.map(min => (
                <div 
                  key={min.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-xs"
                          style={{ backgroundColor: min.color }}
                        >
                          {min.siglas}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={min.nombre}>
                            {min.nombre}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                            {min.ministro}
                          </span>
                        </div>
                      </div>

                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                        {min.projectCount}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg text-xs mb-2.5">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Inversión</span>
                        <span className="font-bold text-slate-900 text-[11px] font-mono">
                          {formatQuetzales(min.totalPresupuesto)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Drive Docs</span>
                        <span className="font-bold text-red-800 text-[11px] flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {min.docsCount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between font-medium text-slate-600">
                        <span>Avance Físico</span>
                        <span className="font-bold text-slate-900">{min.avgAvanceFisico}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full" 
                          style={{ width: `${min.avgAvanceFisico}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMinistryFilter(min.siglas);
                        setActiveTabSubView('proyectos');
                      }}
                      className="text-[11px] font-bold text-red-800 hover:text-red-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver Proyectos</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPurchaseToEdit(null);
                        setIsPurchaseModalOpen(true);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                    >
                      + Proyecto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VISTA 2: LISTADO DE PROYECTOS INTERACTIVO */}
      {activeTabSubView === 'proyectos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Barra de Filtros */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Filtrar por Ministerio:
              </span>
              <select
                value={selectedMinistryFilter}
                onChange={(e) => setSelectedMinistryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              >
                <option value="todos">Todos los Ministerios ({projects.length})</option>
                {MINISTERIOS_GUATEMALA.map(m => (
                  <option key={m.id} value={m.siglas}>
                    {m.siglas} - {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar código o nombre..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Código / Proyecto</th>
                  <th className="px-4 py-3">Ministerio</th>
                  <th className="px-4 py-3">Estatus</th>
                  <th className="px-4 py-3 text-right">Presupuesto</th>
                  <th className="px-4 py-3 text-center">Avance Físico</th>
                  <th className="px-4 py-3 text-center">Google Drive</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron proyectos para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    const min = p.siglasMinisterio ? getMinisterioBySiglas(p.siglasMinisterio) : null;
                    const driveDocsCount = p.documentosDrive ? p.documentosDrive.length : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-red-900 block text-[11px]">
                            {p.codigo}
                          </span>
                          <span className="font-bold text-slate-900 line-clamp-1">
                            {p.nombre}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: min ? min.color : '#8B0000' }}
                          >
                            <span>{p.siglasMinisterio || 'CIV'}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {p.estatus}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatQuetzales(p.presupuestoAsignado)}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-800 text-[11px]">
                              {p.avanceFisico}%
                            </span>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-0.5 overflow-hidden">
                              <div 
                                className="bg-emerald-600 h-full rounded-full" 
                                style={{ width: `${p.avanceFisico}%` }} 
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {p.googleDriveFolderUrl ? (
                            <a
                              href={p.googleDriveFolderUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-900 text-[11px] font-bold border border-red-200 transition-colors"
                            >
                              <Folder className="w-3.5 h-3.5 text-red-700" />
                              <span>{driveDocsCount} {driveDocsCount === 1 ? 'doc' : 'docs'}</span>
                              <ExternalLink className="w-3 h-3 text-red-600" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedPurchase(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ver Ficha</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VISTA 3: CONTROL DOCUMENTAL GOOGLE DRIVE */}
      {activeTabSubView === 'drive' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-900 flex items-center justify-center font-bold">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Repositorios Oficiales en Google Drive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Acceso directo a carpetas de proyectos y expedientes de licitación en la nube
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-red-800 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                {globalKPIs.totalDriveDocs} Expedientes Registrados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p => {
                const min = p.siglasMinisterio ? getMinisterioBySiglas(p.siglasMinisterio) : null;
                const docs = p.documentosDrive || [];
                return (
                  <div 
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition-all bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: min ? min.color : '#8B0000' }}
                        >
                          {p.siglasMinisterio || 'CIV'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {p.codigo}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">
                        {p.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                        {p.ministerio}
                      </p>

                      <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Expedientes:</span>
                          <span className="font-bold text-slate-900">{docs.length} documentos</span>
                        </div>
                        {docs.slice(0, 2).map(d => (
                          <div key={d.id} className="text-[10px] text-slate-600 truncate flex items-center gap-1">
                            <FileText className="w-3 h-3 text-red-600 flex-shrink-0" />
                            <span className="truncate">{d.nombre}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={p.googleDriveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-red-200" />
                        <span>Abrir Drive</span>
                        <ExternalLink className="w-3 h-3 text-red-300" />
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedPurchase(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
