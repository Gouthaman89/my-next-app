import React, { useState, useEffect } from "react";
import VendorServicesController from "../controllers/VendorServicesController";
import VendorServicesTable from "../components/VendorServicesTable";
import AddServiceModal from "../components/AddServiceModal";
import { useGlobalContext } from "../components/GlobalContext";
import Loader from "../components/Loader/loader";

const VendorServicesPage = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

const { globalOrgId } = useGlobalContext();
 const loadServices = async (orgId) => {
  setLoading(true);
  const data = await VendorServicesController.getServices(orgId);
  setServices(data);
  setLoading(false);
};

  useEffect(() => {
    if (globalOrgId) {
      loadServices(globalOrgId);
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
        供應商服務
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button onClick={() => setShowModal(true)}>服務新增</button>
        <button>從 Excel 匯入</button>
        <button onClick={() => loadServices(globalOrgId)}>重新整理</button>
      </div>

      <VendorServicesTable data={services} refreshServices={loadServices} />

      {/* 🔁 Modal */}
      <AddServiceModal
        show={showModal}
        onClose={() => setShowModal(false)}
        refreshServices={() => loadServices(globalOrgId)}
      />
          </div>
    )}
  </>
);
};

export default VendorServicesPage;
