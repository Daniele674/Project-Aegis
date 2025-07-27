import React, {createContext, useState} from 'react';

export const OrgContext = createContext();

export const OrgProvider = ({children}) => {
 const [org, setOrg] = useState('MSP1');
 
 return(
  <OrgContext.Provider value={{org,setOrg}}>
   {children}
  </OrgContext.Provider>
 );
};
