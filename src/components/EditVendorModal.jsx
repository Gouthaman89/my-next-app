import React, { useState, useEffect } from "react";
import { VendorController } from "../controllers/VendorController";

const EditVendorModal = ({ vendor, show, onClose, onSuccess }) => {
  const [form, setForm] = useState({ taxcode: "", name: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [ghgOptions, setGHGOptions] = useState([]);
  const [selectedGHG, setSelectedGHG] = useState(null);

  useEffect(() => {
    if (vendor) {
      setForm({ taxcode: vendor.taxcode || "", name: vendor.name || "" });
      VendorController.getGHGOptions().then((options) => {
      setGHGOptions(options);

      // Optional: preselect current GHG if vendor has one
      const matched = options.find(o => o.scopeid === vendor.scopeid);
      setSelectedGHG(matched || null);
      });
    }
  }, [vendor]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveClick = () => {
    setShowConfirm(true); // show confirmation step
  };

  const handleConfirmUpdate = async () => {
    await VendorController.updateVendor({
        venderid: vendor.venderid,
        vendertaxcode: form.taxcode,
        vendername: form.name,
        scopeid: selectedGHG?.scopeid || "",
        typeofghg: selectedGHG?.typeofghg || ""
    });
    onClose();
    setShowConfirm(false);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <div style={{
        background: "#fff", padding: "20px", borderRadius: "8px", width: "300px"
      }}>
        <h3>編輯供應商</h3>

        <input
          name="taxcode"
          placeholder="統編 taxcode"
          value={form.taxcode}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
        />
        <input
          name="name"
          placeholder="名稱 name"
          value={form.name}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
        />

        <label>溫室氣體類型 (GHG Type)：</label>
        <select
        value={selectedGHG?.scopeid || ""}
        onChange={(e) => {
            const selected = ghgOptions.find(o => o.scopeid === e.target.value);
            setSelectedGHG(selected);
        }}
        style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
        >
        <option value="">-- 請選擇 --</option>
        {ghgOptions.map((opt) => (
            <option key={opt.scopeid} value={opt.scopeid}>
            {opt.typeofghg}
            </option>
        ))}
        </select>

        <div style={{ textAlign: "right" }}>
          <button onClick={handleSaveClick} style={{ marginRight: "10px" }}>儲存</button>
          <button onClick={onClose} >取消</button>
        </div>

        {/* ✅ Confirmation Popup */}
        {showConfirm && (
          <div style={{
            marginTop: "20px", padding: "10px",
            backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #ccc"
          }}>
            <p>確定要更新以下資料？</p>
            <div><strong>統編：</strong>{form.taxcode}</div>
            <div><strong>名稱：</strong>{form.name}</div>

            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button onClick={handleCancelConfirm} style={{ marginRight: "8px" }}>取消</button>
              <button onClick={handleConfirmUpdate}>確認更新</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditVendorModal;
