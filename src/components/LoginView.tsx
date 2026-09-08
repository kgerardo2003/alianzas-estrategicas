import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  Layers,
  Building2,
  FolderLock
} from 'lucide-react';
import { OJLogo } from './OJLogo';

export const LoginView: React.FC = () => {
  const { login, customLogoConfig } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor ingrese su usuario y contraseña institucional.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const ok = login(username.trim(), password.trim());
      if (!ok) {
        setErrorMsg('Credenciales inválidas. Verifique su usuario y contraseña.');
        setIsLoading(false);
      } else {
        setSuccessMsg('Autenticación exitosa. Cargando entorno de control de proyectos...');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#120305] text-slate-100 font-sans relative overflow-x-hidden selection:bg-red-700 selection:text-white">
      
      {/* Fondo con Textura Sutil en tonos Carmesí */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#8B0000 0.85px, transparent 0.85px), radial-gradient(#4a070e 0.85px, #120305 0.85px)`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px'
        }}
      />

      {/* Barra Superior Decorativa en Tonos Rojo Rubí y Oro */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4a070e] via-red-600 to-[#4a070e]" />

      {/* Contenedor Principal Centrado */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4 sm:my-8">
        <div className="w-full max-w-lg bg-[#1f0509]/95 backdrop-blur-md rounded-2xl border border-red-800/40 shadow-2xl overflow-hidden">
          
          {/* Encabezado con Logotipo Oficial FIRME */}
          <div className="p-6 sm:p-8 text-center border-b border-red-900/50 bg-gradient-to-b from-[#2a070d] to-[#1a0407]">
            
            <div className="w-full flex justify-center mb-3">
              <OJLogo size="xl" layout="stacked" variant="full" lightMode={false} />
            </div>

            <div className="mt-4 pt-3 border-t border-red-900/40 flex items-center justify-center gap-2 text-red-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>{customLogoConfig?.subtitle || 'Sistema de Control de Proyectos'}</span>
            </div>
            <p className="text-[11px] text-red-200/80 mt-1">
              Fiscalización y Trazabilidad en los 14 Ministerios de Gobierno de Guatemala
            </p>
          </div>

          {/* Formulario de Inicio de Sesión */}
          <div className="p-6 sm:p-8 bg-[#180407]">
            
            {/* Alertas */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Error de Verificación:</span>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Campo Usuario */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-red-200 mb-1.5">
                  Usuario Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingrese su usuario"
                    disabled={isLoading}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0e0204]/90 border border-red-800/40 rounded-xl text-white text-xs placeholder:text-red-300/40 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-red-200 mb-1.5">
                  Contraseña de Seguridad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0e0204]/90 border border-red-800/40 rounded-xl text-white text-xs placeholder:text-red-300/40 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-red-700 via-rose-700 to-red-800 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-red-500/30"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando credenciales...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Iniciar Sesión en el Sistema</span>
                  </>
                )}
              </button>
            </form>

            {/* Aviso Institucional de Seguridad y Privacidad */}
            <div className="mt-6 pt-5 border-t border-red-900/40">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0e0204]/80 border border-red-900/30 text-slate-300">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed text-left">
                  <p className="font-bold text-xs text-white">
                    Acceso Oficial Restringido y Auditado
                  </p>
                  <p className="text-[11px] text-red-100/70">
                    Plataforma interinstitucional para el control, supervisión física y seguimiento documental en Google Drive de obras y proyectos ministeriales.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Pie del Panel de Login */}
          <div className="px-6 py-3 bg-[#0c0103] border-t border-red-950 flex items-center justify-between text-[10px] text-red-300/70 font-mono">
            <span>PLATAFORMA: FIRME-SEC-01</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CONECTADO A FIRESTORE CLOUD
            </span>
          </div>

        </div>
      </div>

      {/* Pie de Página Institucional */}
      <footer className="w-full py-4 text-center text-xs text-red-300/60 z-10 border-t border-red-950 bg-[#0a0102]">
        <p className="font-medium">
          Alianzas Estratégicas - FIRME • Sistema de Control de Proyectos
        </p>
        <p className="text-[10px] text-red-400/40 mt-0.5">
          Ministerios de la República de Guatemala • Control Documental Google Drive
        </p>
      </footer>
    </div>
  );
};

export default LoginView;
