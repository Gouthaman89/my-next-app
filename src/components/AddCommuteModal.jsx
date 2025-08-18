import React, { useState, useEffect } from "react";
import EmployeeCommuteController from "../controllers/EmployeeCommuteController";
import styles from './EditAttendanceModal.module.css';
import { useGlobalContext } from '../components/GlobalContext';
import { useAuth } from '../components/AuthContext';


const AddCommuteModal = ({ show, onClose, refresh }) => {
  const [form, setForm] = useState({
    codeofemp: "",
    dateofstart: "",
    dateofend: "",
    distofstart: "",
    distofend: "",
    venderserviceid: ""
  });

  const [objectOptions, setObjectOptions] = useState([]);
  const [error, setError] = useState("");
  const { personId } = useAuth();
  const { globalOrgId } = useGlobalContext();
  // fetch commute object (transportation) options
  useEffect(() => {
    if (show) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_dropdown_commute_object`)
        .then(res => res.json())
        .then(setObjectOptions)
        .catch(() => setObjectOptions([]));
    }
  }, [show]);

  const requiredFields = [
    "codeofemp", "dateofstart", "dateofend", "distofstart", "distofend", "venderserviceid"
  ];
  const missingFields = requiredFields.filter(f => !form[f]);
  const isFormValid = missingFields.length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isFormValid) {
      setError("請填寫所有欄位！");
      return;
    }
    const payload = {
  ...form,
  idofperson: personId,
  idoforg: globalOrgId
};

await EmployeeCommuteController.addCommute(payload);
    refresh(globalOrgId);
    onClose();
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-modal-title"
      >
        <header className={styles.modalHeader}>
          <h3 id="add-modal-title" className={styles.modalTitle}>新增通勤資料</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>
        </header>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>員編：</label>
              <input
                name="codeofemp"
                className={`${styles.input} ${!form.codeofemp ? styles.errorInput : ""}`}
                value={form.codeofemp}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>開始日期：</label>
              <input
                type="date"
                name="dateofstart"
                className={`${styles.input} ${!form.dateofstart ? styles.errorInput : ""}`}
                value={form.dateofstart}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>結束日期：</label>
              <input
                type="date"
                name="dateofend"
                className={`${styles.input} ${!form.dateofend ? styles.errorInput : ""}`}
                value={form.dateofend}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>交通工具：</label>
              <select
                name="venderserviceid"
                className={`${styles.input} ${!form.venderserviceid ? styles.errorInput : ""}`}
                value={form.venderserviceid}
                onChange={handleChange}
              >
                <option value="">請選擇</option>
                {objectOptions.map(opt => (
                  <option key={opt.venderserviceid} value={opt.venderserviceid}>
                    {opt.venderservicename}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>出發地：</label>
              <input
                name="distofstart"
                className={`${styles.input} ${!form.distofstart ? styles.errorInput : ""}`}
                value={form.distofstart}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>目的地：</label>
              <input
                name="distofend"
                className={`${styles.input} ${!form.distofend ? styles.errorInput : ""}`}
                value={form.distofend}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <footer className={styles.modalActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={onClose}
            >
              取消
            </button>
            {isFormValid && (
              <button
                type="submit"
                className={`${styles.button} ${styles.primaryButton}`}
              >
                新增
              </button>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddCommuteModal;