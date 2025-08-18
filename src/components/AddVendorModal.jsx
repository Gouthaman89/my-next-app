import React, { useState, useEffect } from "react";
import VendorController from "../controllers/VendorController";

const AddVendorModal = ({ show, onClose, refreshVendors }) => {
  const [form, setForm] = useState({
    vendertaxcode: "",
    vendername: "",
    scopeid: "",
    typeofghg: ""
  });

  const [ghgOptions, setGHGOptions] = useState([]);

  useEffect(() => {
    VendorController.getGHGOptions().then(setGHGOptions);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleScopeChange = (e) => {
    const selectedScope = ghgOptions.find(o => o.scopeid === e.target.value);
    setForm(prev => ({
      ...prev,
      scopeid: selectedScope.scopeid,
      typeofghg: selectedScope.typeofghg
    }));
  };

  const handleSubmit = async () => {
    await VendorController.submitVendor(form);
    refreshVendors();
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
        <h3>供應商新增</h3>

        <label>統編：</label>
        <input name="vendertaxcode" value={form.vendertaxcode} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "6px" }} />

        <label>名稱：</label>
        <input name="vendername" value={form.vendername} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "6px" }} />

        <label>範疇三類別：</label>
        <select value={form.scopeid} onChange={handleScopeChange} style={{ width: "100%", marginBottom: "10px", padding: "6px" }}>
          <option value="">-- 請選擇 --</option>
          {ghgOptions.map((opt) => (
            <option key={opt.scopeid} value={opt.scopeid}>
              {opt.typeofghg}
            </option>
          ))}
        </select>

        <div style={{ marginTop: "16px", textAlign: "right" }}>
          <button onClick={handleSubmit} style={{ marginRight: "8px" }}>新增</button>
          <button onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
};

export default AddVendorModal;
