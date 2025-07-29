import React, { createContext, useState } from 'react';

export const OrgContext = createContext();

export const OrgProvider = ({ children }) => {
  // --- MODIFICA QUI ---
  // Imposta il valore di default corretto
  const [org, setOrg] = useState('Org1MSP');

  return (
    <OrgContext.Provider value={{ org, setOrg }}>
      {children}
    </OrgContext.Provider>
  );
};
