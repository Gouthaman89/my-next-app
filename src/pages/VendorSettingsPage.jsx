import React, { useState } from "react";
import Toolbar from "../components/Toolbar";
import VendorTable from "../components/VendorTable";
import VendorController from "../controllers/VendorController";
import { useGlobalContext } from "../components/GlobalContext";
import { useEffect } from "react";
import Loader from "../components/Loader/loader";

const VendorSettingsPage = () => {
  const [vendors, setVendors] = useState([]);
  const { globalOrgId } = useGlobalContext();
  const [loading, setLoading] = useState(false);

const loadVendors = async (orgId) => {
  setLoading(true);
  const data = await VendorController.loadVendorData(orgId);
  setVendors(data);
  setLoading(false);
};
useEffect(() => {
  if (globalOrgId) {
    loadVendors(globalOrgId);
  }
}, [globalOrgId]);

  return (
  <>
    {loading ? (
      <Loader />
    ) : (
      <div>
      <div style={{
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "16px",
        borderBottom: "1px solid #ccc",
        paddingBottom: "8px"
      }}>
        供應商設定vender
      </div>

     <Toolbar
  setVendors={setVendors}
  refreshVendors={() => loadVendors(globalOrgId)}
  showAdd={true}
  showImport={true}
/>
<VendorTable vendors={vendors} refreshVendors={() => loadVendors(globalOrgId)} />
          </div>
    )}
  </>
);
};

export default VendorSettingsPage;
