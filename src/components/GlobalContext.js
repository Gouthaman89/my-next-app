// GlobalContext.js
import { createContext, useContext, useState } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [globalReportId, setGlobalReportId] = useState(null);
  const [globalOrgId, setGlobalOrgId] = useState(null);
  const [globalYear, setGlobalYear] = useState(null);
  const [globalYearid, setGlobalYearid] = useState(null);
  const [globalCompanyId, setGlobalCompanyId] = useState('');
  const [companyList, setCompanyList] = useState([]);
  const [organizationList, setOrganizationList] = useState([]);
  return (
    <GlobalContext.Provider value={{ globalReportId, setGlobalReportId, globalCompanyId, setGlobalCompanyId, globalOrgId, setGlobalOrgId, globalYear, setGlobalYear, globalYearid, setGlobalYearid, companyList, setCompanyList, organizationList, setOrganizationList }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);