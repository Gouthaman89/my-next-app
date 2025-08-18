import React, { useState, useEffect } from "react";
import VendorServicesController from "../controllers/VendorServicesController";

const EditServiceModal = ({ show, service, onClose, refreshServices }) => {
  const [form, setForm] = useState({
    servicename: "",
    productnumber: ""
  });

  useEffect(() => {
    if (service) {
      setForm({
        servicename: service.servicename || "",
        productnumber: service.productnumber || ""
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const updatedData = {
      ...service,
      servicename: form.servicename,
      productnumber: form.productnumber
    };
    await VendorServicesController.updateService(updatedData);
    refreshServices();
    onClose();
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        width: "320px"
      }}>
        <h3>編輯服務</h3>

        <label>服務名稱：</label>
        <input
          name="servicename"
          value={form.servicename}
          onChange={handleChange}
          style={{ width: "300px", height: "29.33px", marginBottom: "10px" }}
        />

        <label>產品代碼：</label>
        <input
          name="productnumber"
          value={form.productnumber}
          onChange={handleChange}
          style={{ width: "300px", height: "29.33px", marginBottom: "10px" }}
        />

        <div style={{ textAlign: "right" }}>
          <button onClick={handleSave} style={{ marginRight: "8px" }}>儲存</button>
          <button onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
};

export default EditServiceModal;
