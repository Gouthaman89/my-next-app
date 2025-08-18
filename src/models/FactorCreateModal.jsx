import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useGlobalContext } from "../components/GlobalContext";
const FactorCreateModal = ({ open, onClose, onSuccess, vendorId, scopeId, serviceId, selectedServiceData }) => {
  const { globalCompanyId, globalOrgId } = useGlobalContext();
const globalCountryId = '92e19c8a-c867-40c3-a0ad-d70c0c143045';
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [form, setForm] = useState({
    pkgversion: "",
    pkgid: "",
    pkgname: "",

    factorid: "",
    idofpkg: "",
    factorcode: "",
    objectid: "",
    factorname: "",

    unitid: "",
    unitname: "",
    gasid: "",
    factor: "",

    idofleveloffactor: "",
    nameofleveloffactor: "",
    gasname: "",
    description: ""
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [gasOptions, setGasOptions] = useState([]);
  const [unitTypeOptions, setUnitTypeOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [selectedUnitType, setSelectedUnitType] = useState(null);
  const [pkgOptions, setPkgOptions] = useState([]);
  const [selectedPkgname, setSelectedPkgname] = useState(null);

  useEffect(() => {
    if (!open) return;

    Promise.all([
      fetch(`${baseURL}/icx_dropdown_gas`).then(res => res.json()).then(setGasOptions),
      fetch(`${baseURL}/icx_dropdown_unittype`).then(res => res.json()).then(setUnitTypeOptions),
      fetch(`${baseURL}/icx_dropdown_pkgname`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idoforg: globalOrgId,
          idofcompany: globalCompanyId
        })
      }).then(res => res.json()).then(setPkgOptions)
    ]);
  }, [open]);

  useEffect(() => {
    if (!selectedUnitType) return;
    fetch(`${baseURL}/icx_dropdown_unit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unittypeid: selectedUnitType.value })
    })
      .then(res => res.json())
      .then(setUnitOptions);
  }, [selectedUnitType]);

  useEffect(() => {
    if (!open || !selectedServiceData) return;
    setForm(prev => ({
      ...prev,
      factorid: selectedServiceData.serviceid || "",
      factorcode: selectedServiceData.productnumber || "",
      objectid: selectedServiceData.serviceid || "",
      factorname: selectedServiceData.servicename || ""
    }));
  }, [open, selectedServiceData]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toSelect = (options, idKey, labelKey) =>
    options.map(opt => ({ value: opt[idKey], label: opt[labelKey], ...opt }));

  const distinctPkgnames = [...new Set(pkgOptions.map(opt => opt.pkgname))];
  const pkgnameOptions = distinctPkgnames.map(name => ({ value: name, label: name }));
  const filteredPkgVersions = selectedPkgname
    ? pkgOptions.filter(opt => opt.pkgname === selectedPkgname.value)
    : [];
  const distinctPkgVersions = [...new Set(filteredPkgVersions.map(opt => opt.pkgversion))];
  const pkgversionOptions = distinctPkgVersions.map(ver => ({ value: ver, label: ver }));

  const handlePkgversionChange = (selected) => {
    const matched = pkgOptions.find(
      opt => opt.pkgversion === selected?.value && opt.pkgname === form.pkgname
    );
    handleChange("pkgversion", selected?.value || "");
    handleChange("pkgid", matched?.pkgid || "");
  };

  const handleConfirm = async () => {
    const payload = {
      ...form,
      idofpkg: form.pkgid,
      idofvender: vendorId,
      idofscope: scopeId,
      idofservice: serviceId,
      idofcompany: globalCompanyId,
      idoforg: globalOrgId,
      idofcountry: globalCountryId
    };

    try {
      const res = await fetch(`${baseURL}/scope3_add_factor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert("新增失敗");
      }
    } catch (err) {
      console.error("Failed to add factor", err);
      alert("發生錯誤");
    }
  };

  return !open ? null : (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", width: "500px", maxHeight: "80vh", overflowY: "auto", boxSizing: "border-box" }}>
        <h3 style={{ marginBottom: "16px" }}>新增係數</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label>版本名稱：</label>
          <Select
            options={pkgnameOptions}
            value={selectedPkgname}
            onChange={(selected) => {
              setSelectedPkgname(selected);
              handleChange("pkgname", selected?.value || "");
              handleChange("pkgversion", "");
              handleChange("pkgid", "");
            }}
            placeholder="版本名稱"
          />

          <label>版本：</label>
          <Select
            options={pkgversionOptions}
            value={pkgversionOptions.find(opt => opt.value === form.pkgversion)}
            onChange={handlePkgversionChange}
            placeholder="版本"
            isDisabled={!selectedPkgname}
          />

          <label>係數值：</label>
          <input
            type="number"
            value={form.factor}
            onChange={(e) => handleChange("factor", e.target.value)}
            style={{ padding: "8px", height: "18px" }}
          />

          <label>單位類型：</label>
          <Select
            options={toSelect(unitTypeOptions, "unittypeid", "unittypename")}
            value={selectedUnitType}
            onChange={(selected) => {
              setSelectedUnitType(selected);
              handleChange("unitid", "");
              handleChange("unitname", "");
            }}
            placeholder="單位類型"
          />

          <label>係數單位：</label>
          <Select
            options={unitOptions.map(opt => ({ value: opt.unitid, label: opt.unitname, ...opt }))}
            value={unitOptions.map(opt => ({ value: opt.unitid, label: opt.unitname, ...opt })).find(opt => opt.value === form.unitid)}
            onChange={(selected) => {
              handleChange("unitid", selected?.value || "");
              handleChange("unitname", selected?.unitname || "");
            }}
            placeholder="係數單位"
            isDisabled={!selectedUnitType}
          />

          <label>對應氣體：</label>
          <Select
            options={toSelect(gasOptions, "gasid", "gasname")}
            value={toSelect(gasOptions, "gasid", "gasname").find(opt => opt.value === form.gasid)}
            onChange={(selected) => {
              handleChange("gasid", selected?.value || "");
              handleChange("gasname", selected?.gasname || "");
            }}
            placeholder="對應氣體"
          />

          <label>備註：</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            style={{ padding: "8px", height: "60px", resize: "none" }}
          />
        </div>

        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <button onClick={onClose} style={{ marginRight: "10px" }}>取消</button>
          <button onClick={() => setShowConfirm(true)}>確認</button>
        </div>

        {showConfirm && (
          <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #ccc" }}>
            <p>確定要新增此係數資料？</p>
            <div><strong>版本：</strong>{form.pkgversion}</div>
            <div><strong>版本名稱：</strong>{form.pkgname}</div>
            <div><strong>係數名稱：</strong>{form.factorname}</div>
            <div><strong>產品代碼：</strong>{form.factorcode}</div>
            <div><strong>係數值：</strong>{form.factor}</div>
            <div><strong>係數單位：</strong>{form.unitname}</div>
            <div><strong>對應氣體：</strong>{form.gasname}</div>
            <div><strong>備註：</strong>{form.description}</div>
            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button onClick={() => setShowConfirm(false)} style={{ marginRight: "10px" }}>取消</button>
              <button onClick={handleConfirm}>確認新增</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactorCreateModal;
