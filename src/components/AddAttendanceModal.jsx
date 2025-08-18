import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import EmployeeAttendanceController from "../controllers/EmployeeAttendanceController";
import styles from "./EditAttendanceModal.module.css";
import { useGlobalContext } from '../components/GlobalContext';
import { useAuth } from '../components/AuthContext';
const AddAttendanceModal = ({ open, onClose, refresh }) => {
  const [form, setForm] = useState({
    codeofemp: "",
    dateofcomm: "",
 
    idofcommutingemp: ""
  });
    const {
      personId
    } = useAuth();
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
 const { globalOrgId } = useGlobalContext();

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleEscKey);
    }
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_dropdown_employee`)
        .then(res => res.json())
        .then(setEmployeeOptions)
        .catch(err => console.error("Failed to fetch employee options", err));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    const selected = employeeOptions.find(opt => opt.codeofemp === value);
    setForm(prev => ({
      ...prev,
      codeofemp: value,
      idofcommutingemp: selected ? selected.employeeid : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        codeofemp: form.codeofemp,
        dateofcomm: form.dateofcomm,
        idoforg: globalOrgId,
        idofperson: personId
      };
      await EmployeeAttendanceController.addRecord(payload);
      refresh();
      onClose();
    } catch (err) {
      console.error("Failed to add record:", err);
      setError("新增失敗，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        <header className={styles.modalHeader}>
          <h3 id="modal-title" className={styles.modalTitle}>新增出勤資料</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="codeofemp" className={styles.label}>員編：</label>
            <input
              list="employeeList"
              id="codeofemp"
              name="codeofemp"
              className={styles.input}
              value={form.codeofemp}
              onChange={handleCodeChange}
              disabled={isLoading}
            />
            <datalist id="employeeList">
              {employeeOptions.map(opt => (
                <option key={opt.codeofemp} value={opt.codeofemp} />
              ))}
            </datalist>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dateofcomm" className={styles.label}>日期：</label>
            <input
              type="date"
              id="dateofcomm"
              name="dateofcomm"
              className={styles.input}
              value={form.dateofcomm}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

    

          {error && <p className={styles.errorMessage}>{error}</p>}

          <footer className={styles.modalActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={isLoading}
            >
              {isLoading ? "新增中..." : "新增"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

AddAttendanceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired
};

export default AddAttendanceModal;