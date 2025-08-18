import React, { useState, useEffect } from "react";
import VendorFactorController from "../controllers/VendorFactorController";
import VendorFactorTable from "../components/VendorFactorTable";
import { useGlobalContext } from "../components/GlobalContext";
import Loader from "../components/Loader/loader";

const VendorFactorPage = () => {
  const [factors, setFactors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { globalOrgId } = useGlobalContext();
  const [loading, setLoading] = useState(false);

 const loadFactors = async (orgId) => {
  setLoading(true);
  const data = await VendorFactorController.getFactors(orgId);
  setFactors(data);
  setLoading(false);
};

  useEffect(() => {
    if (globalOrgId) {
      loadFactors(globalOrgId);
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
        供應商係數設定
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button onClick={() => setShowModal(true)}>係數新增</button>
        <button onClick={() => loadFactors(globalOrgId)}>重新整理</button>
      </div>

      <VendorFactorTable data={factors} refreshFactors={() => loadFactors(globalOrgId)} />

      {/* Future modal:
      <AddFactorModal
        show={showModal}
        onClose={() => setShowModal(false)}
        refreshFactors={loadFactors}
      />
      */}
       </div>
    )}
  </>
);
}

export default VendorFactorPage;
