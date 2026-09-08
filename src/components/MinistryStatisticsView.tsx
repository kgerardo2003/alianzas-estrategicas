import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Download, 
  Search, 
  ExternalLink, 
  Folder, 
  HardDrive,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronRight
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
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { MINISTERIOS_GUATEMALA, MinisterioGuatemala, getMinisterioBySiglas } from '../data/ministeriosData';
import { formatQuetzales, formatDate, exportToCSV } from '../utils/formatters';
import { ProjectRecord } from '../types';

export const MinistryStatisticsView: React.FC = () => {
  const { purchases, setSelectedPurchase, setActiveTab, setIsPurchaseModalOpen, setPurchaseToEdit } = useApp();

  const [selectedMinistryId, setSelectedMinistryId] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [metricType, setMetricType] = useState<'monto' | 'proyectos' | 'avance'>('monto');

  // Convert purchases to ProjectRecord array
  const projects: ProjectRecord[] = useMemo(() => {
    return purchases.map(p => {
      const min = p.siglasMinisterio ? getMinisterioBySiglas(p.siglasMinisterio) : null;
      return {
        ...p,
        nombre: p.nombre || p.descripcion,
        codigo: p.codigo || p.f56e || p.id,
        presupuestoAsignado: p.presupuestoAsignado || p.monto,
        presupuestoEjecutado: p.presupuestoEjecutado || (p.monto * ((p.avanceFinanciero || 40) / 100)),
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

  // Aggregate statistics per ministry
  const ministryStats = useMemo(() => {
    return MINISTERIOS_GUATEMALA.map(min => {
      const minProjects = projects.filter(p => 
        p.siglasMinisterio === min.siglas || 
        (p.ministerio && p.ministerio.toLowerCase().includes(min.siglas.toLowerCase())) ||
        (p.ministerio && p.ministerio.toLowerCase() === min.nombre.toLowerCase())
      );

      const totalPresupuesto = minProjects.reduce((sum, p) => sum + (p.presupuestoAsignado || p.monto || 0), 0);
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

  // Totals for all ministries
  const globalStats = useMemo(() => {
    const totalProjects = projects.length;
    const totalPresupuesto = projects.reduce((acc, p) => acc + (p.presupuestoAsignado || p.monto || 0), 0);
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

  // Data for Recharts Bar Chart
  const chartData = useMemo(() => {
    return ministryStats
      .filter(m => m.projectCount > 0 || selectedMinistryId === 'todos')
      .map(m => ({
        name: m.siglas,
        fullName: m.nombre,
        color: m.color,
        proyectos: m.projectCount,
        presupuesto: m.totalPresupuesto,
        ejecutado: m.totalEjecutado,
        avanceFisico: m.avgAvanceFisico,
        avanceFinanciero: m.avgAvanceFinanciero,
        driveDocs: m.docsCount
      }))
      .sort((a, b) => b.presupuesto - a.presupuesto);
  }, [ministryStats, selectedMinistryId]);

  // Data for Donut Chart (Budget distribution)
  const donutData = useMemo(() => {
    return ministryStats
      .filter(m => m.totalPresupuesto > 0)
      .map(m => ({
        name: m.siglas,
        value: m.totalPresupuesto,
        color: m.color
      }))
      .sort((a, b) => b.value - a.value);
  }, [ministryStats]);

  // Filtered projects for the detailed list
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesMinistry = selectedMinistryId === 'todos' || 
        p.siglasMinisterio === selectedMinistryId ||
        (p.ministerio && p.ministerio.toLowerCase().includes(selectedMinistryId.toLowerCase()));
      const matchesSearch = !searchTerm ||
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.ministerio && p.ministerio.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesMinistry && matchesSearch;
    });
  }, [projects, selectedMinistryId, searchTerm]);

  const handleExportCSV = () => {
    const dataToExport = filteredProjects.map(p => ({
      'Código Proyecto': p.codigo,
      'Nombre del Proyecto': p.nombre,
      'Ministerio': p.ministerio,
      'Siglas': p.siglasMinisterio,
      'Estatus': p.estatus,
      'Presupuesto Asignado (Q)': p.presupuestoAsignado,
      'Presupuesto Ejecutado (Q)': p.presupuestoEjecutado,
      'Avance Físico (%)': p.avanceFisico,
      'Avance Financiero (%)': p.avanceFinanciero,
      'Carpeta Google Drive': p.googleDriveFolderUrl || 'N/A',
      'Documentos en Drive': p.documentosDrive ? p.documentosDrive.length : 0
    }));
    exportToCSV(dataToExport, `Estadisticas_Proyectos_Ministerios_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado del Módulo de Estadísticas */}
      <div className="bg-gradient-to-r from-[#180407] via-[#350910] to-[#180407] rounded-2xl p-6 text-white border border-[#4c0b14] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600 text-white border border-red-400/40 shadow-sm">
                Gobierno de Guatemala
              </span>
              <span className="text-xs text-red-200/80 font-medium">
                14 Ministerios del Organismo Ejecutivo
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
              Estadísticas y Control de Proyectos por Ministerio
            </h1>
            <p className="text-xs sm:text-sm text-red-100/80 mt-1 max-w-3xl">
              Fiscalización estratégica, avance físico y financiero, control de expedientes en Google Drive e inversión consolidada del Estado de Guatemala.
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
              <Briefcase className="w-4 h-4" />
              <span>+ Nuevo Proyecto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Consolidado Nacional */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Proyectos */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Proyectos
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {globalStats.totalProjects}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              en {globalStats.activeMinistriesCount} ministerios
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Ministerios catalogados</span>
          </div>
        </div>

        {/* Presupuesto Global */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Inversión Total Asignada
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {formatQuetzales(globalStats.totalPresupuesto)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Ejecutado: <strong className="text-slate-800">{formatQuetzales(globalStats.totalEjecutado)}</strong>
          </div>
        </div>

        {/* Avance Físico vs Financiero */}
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
              {globalStats.avgPhysical}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              físico • {globalStats.avgFinancial}% fin.
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div 
              className="bg-red-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${globalStats.avgPhysical}%` }} 
            />
          </div>
        </div>

        {/* Documentos en Google Drive */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Google Drive Cloud
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-900 flex items-center justify-center font-bold">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-950 font-mono">
              {globalStats.totalDriveDocs}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              expedientes activos
            </span>
          </div>
          <div className="mt-2 text-[11px] text-red-700 font-bold flex items-center gap-1">
            <Folder className="w-3.5 h-3.5 text-amber-600" />
            <span>Carpetas enlazadas</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtro Rápido por Ministerio (Chips con Colores Oficiales) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Seleccionar Ministerio de Guatemala:
            </h3>
          </div>
          {selectedMinistryId !== 'todos' && (
            <button
              type="button"
              onClick={() => setSelectedMinistryId('todos')}
              className="text-xs font-bold text-red-700 hover:text-red-900 underline cursor-pointer"
            >
              Ver Todos los Ministerios
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedMinistryId('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMinistryId === 'todos'
                ? 'bg-red-900 text-white shadow-sm ring-2 ring-red-500/50'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos ({projects.length})
          </button>

          {ministryStats.map(min => {
            const isSelected = selectedMinistryId === min.siglas;
            return (
              <button
                key={min.id}
                type="button"
                onClick={() => setSelectedMinistryId(min.siglas)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-red-500/50 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: min.color }} 
                />
                <span>{min.siglas}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {min.projectCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gráficas Estadísticas Interactivas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de Barras Principal: Inversión / Proyectos por Ministerio */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-700" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Presupuesto e Inversión por Ministerio
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Valores consolidados en Quetzales (Q) por entidad de Gobierno
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMetricType('monto')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  metricType === 'monto' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Presupuesto (Q)
              </button>
              <button
                type="button"
                onClick={() => setMetricType('proyectos')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  metricType === 'proyectos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cant. Proyectos
              </button>
              <button
                type="button"
                onClick={() => setMetricType('avance')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  metricType === 'avance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                % Avance Físico
              </button>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }} 
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => {
                    if (metricType === 'monto') {
                      if (val >= 1000000) return `Q${(val/1000000).toFixed(1)}M`;
                      if (val >= 1000) return `Q${(val/1000).toFixed(0)}k`;
                      return `Q${val}`;
                    }
                    if (metricType === 'avance') return `${val}%`;
                    return val;
                  }}
                />
                <Tooltip 
                  formatter={(val: any, name: string) => {
                    if (name === 'Presupuesto Asignado' || name === 'Presupuesto Ejecutado') {
                      return [formatQuetzales(Number(val)), name];
                    }
                    if (name === 'Avance Físico Promedio') {
                      return [`${val}%`, name];
                    }
                    return [val, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName || label;
                  }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {metricType === 'monto' && (
                  <>
                    <Bar dataKey="presupuesto" name="Presupuesto Asignado" fill="#8B0000" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ejecutado" name="Presupuesto Ejecutado" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </>
                )}

                {metricType === 'proyectos' && (
                  <Bar dataKey="proyectos" name="Número de Proyectos" fill="#B91C1C" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                )}

                {metricType === 'avance' && (
                  <>
                    <Bar dataKey="avanceFisico" name="Avance Físico (%)" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avanceFinanciero" name="Avance Financiero (%)" fill="#0284C7" radius={[4, 4, 0, 0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica Circular: Proporción Presupuestaria por Ministerio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-red-700" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Distribución de Presupuesto
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Participación porcentual por cartera ministerial
            </p>
          </div>

          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
              <span className="text-xs font-black text-slate-900 font-mono">
                {formatQuetzales(globalStats.totalPresupuesto).split('.')[0]}
              </span>
            </div>
          </div>

          {/* Lista de Ministerios Principales en el Donut */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2 border-t border-slate-100 text-xs">
            {donutData.slice(0, 5).map(item => {
              const percent = globalStats.totalPresupuesto > 0 
                ? ((item.value / globalStats.totalPresupuesto) * 100).toFixed(1) 
                : '0';
              return (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-600">{formatQuetzales(item.value)}</span>
                    <span className="font-bold text-red-800">({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid de Ministerios de Guatemala con Detalles Oficiales */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-800" />
              <span>Fichas Ministeriales y Avance de Obras</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en cualquier ministerio para consultar sus proyectos o abrir su expediente en Google Drive
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyecto o ministerio..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ministryStats
            .filter(m => {
              if (selectedMinistryId !== 'todos' && m.siglas !== selectedMinistryId) return false;
              if (!searchTerm) return true;
              return m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     m.siglas.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .map(min => {
              return (
                <div 
                  key={min.id}
                  className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 hover:border-red-400/80 bg-white flex flex-col justify-between"
                >
                  <div>
                    {/* Header Ministerio */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm"
                          style={{ backgroundColor: min.color }}
                        >
                          {min.siglas}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {min.nombre}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {min.ministro}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {min.projectCount} {min.projectCount === 1 ? 'proyecto' : 'proyectos'}
                      </span>
                    </div>

                    {/* Métricas del Ministerio */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-slate-50 rounded-lg text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Presupuesto
                        </span>
                        <span className="font-black text-slate-900 font-mono text-[11px]">
                          {formatQuetzales(min.totalPresupuesto)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Expedientes Drive
                        </span>
                        <span className="font-bold text-red-800 flex items-center gap-1 text-[11px]">
                          <HardDrive className="w-3 h-3 text-red-700" />
                          {min.docsCount} docs
                        </span>
                      </div>
                    </div>

                    {/* Barras de Avance */}
                    <div className="mt-3 space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">Avance Físico Promedio</span>
                          <span className="font-bold text-slate-900">{min.avgAvanceFisico}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full" 
                            style={{ width: `${min.avgAvanceFisico}%` }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">Avance Financiero</span>
                          <span className="font-bold text-slate-900">{min.avgAvanceFinanciero}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ width: `${min.avgAvanceFinanciero}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones para el Ministerio */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMinistryId(min.siglas);
                      }}
                      className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver {min.projectCount} proyectos</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPurchaseToEdit(null);
                        setIsPurchaseModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold cursor-pointer"
                    >
                      + Proyecto
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tabla Detallada de Proyectos Filtrados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              <span>Listado de Proyectos ({filteredProjects.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              {selectedMinistryId === 'todos' 
                ? 'Mostrando proyectos de todos los Ministerios de Guatemala' 
                : `Filtrado por: ${selectedMinistryId}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <Download className="w-3.5 h-3.5 text-red-300" />
              <span>Exportar Tabla</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Código / Proyecto</th>
                <th className="px-4 py-3">Ministerio</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3 text-right">Presupuesto Asignado</th>
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
                        {formatQuetzales(p.presupuestoAsignado || p.monto)}
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
                            title="Abrir carpeta de Google Drive"
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
    </div>
  );
};

export default MinistryStatisticsView;
