import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useGlobalContext } from "../components/GlobalContext";

const FactorUpdateModal = ({ open, onClose, onConfirm, initialData }) => {
  const [form, setForm] = useState({
    pkgid: "",
    pkgname: "",
    companyid: "",
    pkgversion: "",
    countryid: "",
    idofleveloffactor: "",
    nameofleveloffactor: "",
    factorid: "",
    idofpkg: "",
    factorcode: "",
    objectid: "",
    factorname: "",
    gomuuid: "",
    fomuuid: "",
    gasid: "",
    factor: "",
    unitname: "",
    scopeid: "",
    description: "",
    unitid: "",
    gasname: ""
  });

  const { globalOrgId } = useGlobalContext();
  const { globalCompanyId } = useGlobalContext();
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [showConfirm, setShowConfirm] = useState(false);
  const [pkgOptionsRaw, setPkgOptionsRaw] = useState([]);
  const [gasOptions, setGasOptions] = useState([]);
  const [unitTypeOptions, setUnitTypeOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [selectedUnitType, setSelectedUnitType] = useState(null);
  const [pkgnameOptions, setPkgnameOptions] = useState([]);
  const [pkgversionOptions, setPkgversionOptions] = useState([]);

  useEffect(() => {
    if (!open) return;

    Promise.all([
      fetch(`${baseURL}/icx_dropdown_pkgname`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idoforg: globalOrgId,
          idofcompany: globalCompanyId
        })
      }).then(res => res.json()).then(setPkgOptionsRaw),
      fetch(`${baseURL}/icx_dropdown_gas`).then(res => res.json()).then(setGasOptions),
      fetch(`${baseURL}/icx_dropdown_unittype`).then(res => res.json()).then(setUnitTypeOptions)
    ]);
  }, [open]);

  useEffect(() => {
    const names = [...new Set(pkgOptionsRaw.map(opt => opt.pkgname))];
    setPkgnameOptions(names.map(name => ({ value: name, label: name })));
  }, [pkgOptionsRaw]);

  useEffect(() => {
    if (form.pkgname) {
      const filteredVersions = pkgOptionsRaw
        .filter(opt => opt.pkgname === form.pkgname)
        .map(opt => opt.pkgversion);
      const uniqueVersions = [...new Set(filteredVersions)];
      setPkgversionOptions(uniqueVersions.map(v => ({ value: v, label: v })));
    } else {
      setPkgversionOptions([]);
    }
  }, [form.pkgname, pkgOptionsRaw]);

  useEffect(() => {
    if (initialData && pkgOptionsRaw.length > 0) {
      setForm(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData, pkgOptionsRaw]);

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

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toSelect = (options, idKey, labelKey) =>
    options.map(opt => ({ value: opt[idKey], label: opt[labelKey], ...opt }));

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "500px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h3 style={{ marginBottom: "16px" }}>編輯係數</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label>版本名稱：</label>
          <Select
            options={pkgnameOptions}
            value={pkgnameOptions.find(opt => opt.value === form.pkgname)}
            onChange={(selected) => {
              handleChange("pkgname", selected?.value || "");
              handleChange("pkgversion", ""); // reset version
            }}
            placeholder="選擇版本名稱"
          />

          <label>版本：</label>
          <Select
            options={pkgversionOptions}
            value={pkgversionOptions.find(opt => opt.value === form.pkgversion)}
            onChange={(selected) => handleChange("pkgversion", selected?.value || "")}
            placeholder="選擇版本"
            isDisabled={!form.pkgname}
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
            value={unitTypeOptions.map(opt => ({
              value: opt.unittypeid,
              label: opt.unittypename,
              ...opt
            })).find(opt => opt.value === selectedUnitType?.value)}
            onChange={(selected) => {
              setSelectedUnitType(selected);
              handleChange("unitid", "");
              handleChange("unittypename", "");
            }}
            placeholder="單位類型"
          />

          <label>係數單位：</label>
          <Select
            options={unitOptions.map(opt => ({
              value: opt.unitid,
              label: opt.unitname,
              ...opt
            }))}
            value={unitOptions.find(opt => opt.unitid === form.unitid) && {
              value: form.unitid,
              label: unitOptions.find(opt => opt.unitid === form.unitid)?.unitname
            }}
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
          <button onClick={() => setShowConfirm(true)}>儲存</button>
        </div>

        {showConfirm && (
          <div style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}>
            <p>確定要更新此係數資料？</p>
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
              <button onClick={() => onConfirm(form)}>確認更新</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactorUpdateModal;
