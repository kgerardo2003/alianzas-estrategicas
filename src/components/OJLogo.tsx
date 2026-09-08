import React from 'react';
import { FirmeLogo, FirmeLogoProps } from './FirmeLogo';

// Backward-compatible wrapper that directs to FirmeLogo
export const OJLogo: React.FC<FirmeLogoProps> = (props) => {
  return <FirmeLogo {...props} />;
};

export default OJLogo;
