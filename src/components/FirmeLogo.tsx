import React from 'react';
import firmeLogoAsset from '../assets/firme_logo.svg';

export interface FirmeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'badge';
  layout?: 'horizontal' | 'stacked';
  lightMode?: boolean;
  className?: string;
  showSubtitle?: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

export const FirmeLogo: React.FC<FirmeLogoProps> = ({
  size = 'md',
  variant = 'full',
  layout = 'stacked',
  lightMode = false,
  className = '',
  showSubtitle = true,
  customTitle,
  customSubtitle
}) => {
  const logoUrl = firmeLogoAsset || '/firme_logo.svg';

  const iconSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-36 h-36'
  };

  const titleText = customTitle || 'Alianzas Estratégicas - FIRME';
  const subtitleText = customSubtitle || 'Sistema de Control de Proyectos';

  const renderEmblem = () => {
    return (
      <div 
        className={`${iconSizes[size]} relative flex items-center justify-center transition-transform duration-200 hover:scale-105 flex-shrink-0 select-none ${className}`}
        title="Alianzas Estratégicas - FIRME"
      >
        <img 
          src={logoUrl} 
          alt="Alianzas Estratégicas - FIRME" 
          className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(139,0,0,0.35)]"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  };

  if (variant === 'icon') {
    return renderEmblem();
  }

  if (layout === 'stacked') {
    return (
      <div className="flex flex-col items-center text-center select-none w-full">
        <div className="flex items-center justify-center p-0.5 relative mb-1.5">
          {renderEmblem()}
        </div>

        <div className="flex flex-col items-center max-w-full px-1">
          <span className={`font-black tracking-wider uppercase text-xs sm:text-sm font-sans leading-tight ${
            lightMode ? 'text-red-950' : 'text-white'
          }`}>
            {titleText}
          </span>
          <div className="flex items-center justify-center gap-1.5 my-0.5">
            <span className={`h-px w-3.5 ${lightMode ? 'bg-red-700/40' : 'bg-red-500/50'}`} />
            <span className={`text-[8.5px] uppercase font-extrabold tracking-widest ${
              lightMode ? 'text-red-800' : 'text-red-400'
            }`}>
              Gobierno de Guatemala
            </span>
            <span className={`h-px w-3.5 ${lightMode ? 'bg-red-700/40' : 'bg-red-500/50'}`} />
          </div>
          {showSubtitle && (
            <span className={`text-[10px] sm:text-[11px] font-medium tracking-tight leading-snug line-clamp-2 ${
              lightMode ? 'text-slate-600' : 'text-red-200/80'
            }`}>
              {subtitleText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className="flex items-center gap-3 select-none">
      {renderEmblem()}

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-black tracking-wide uppercase text-xs sm:text-sm truncate font-sans ${
            lightMode ? 'text-red-950' : 'text-white'
          }`}>
            {titleText}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] uppercase font-black tracking-wider rounded bg-red-600/30 text-red-200 border border-red-500/40 flex-shrink-0">
            FIRME
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-[11px] sm:text-xs font-semibold tracking-normal truncate ${
            lightMode ? 'text-red-800' : 'text-red-200'
          }`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};

export default FirmeLogo;
