import React, { useState, useEffect } from "react";
import VendorServicesController from "../controllers/VendorServicesController";

const AddServiceModal = ({ show, onClose, refreshServices }) => {
  const [form, setForm] = useState({
    servicename: "",
    productnumber: "",
    venderid: ""
  });

  const [venderOptions, setVenderOptions] = useState([]);

  useEffect(() => {
    // Fetch dropdown list from API
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_dropdown_venderid`)
      .then(res => res.json())
      .then(setVenderOptions);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await VendorServicesController.addService(form);
    refreshServices();
    onClose();
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        width: "320px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      }}>
        <h3>服務新增</h3>

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

        <label>供應商：</label>
        <select
          name="venderid"
          value={form.venderid}
          onChange={handleChange}
          style={{ width: "300px", height: "29.33px", marginBottom: "16px" }}
        >
          <option value="">-- 請選擇供應商 --</option>
          {venderOptions.map(opt => (
            <option key={opt.venderid} value={opt.venderid}>
              {opt.vendername}
            </option>
          ))}
        </select>

        <div style={{ textAlign: "right" }}>
          <button onClick={handleSubmit} style={{ marginRight: "8px" }}>新增</button>
          <button onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
