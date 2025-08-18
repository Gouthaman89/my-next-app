// src/components/EditAttendanceModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import EmployeeAttendanceController from '../controllers/EmployeeAttendanceController';
import styles from './EditAttendanceModal.module.css';
import * as PageController from '../controllers/PageControllers';

const EditAttendanceModal = ({ show, record, onClose, refresh }) => {
  const [mapImageBase64, setMapImageBase64] = useState('');
  const [formData, setFormData] = useState({
    codeofemp: '',
    employeename: '',
    dateofcomm: '',
    timeofstart: '',
    timeofend: '',
    dateofstart: '',
    dateofend: '',
    transportation: '',
    startaddress: '',
    destinationaddress: '',
    vendrservicecid: '',
    distance: '',
    linkofmap: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transportationOptions, setTransportationOptions] = useState([]);
   const fetchMapImage = async (filename) => {
  if (!filename) {
    // No map for this record; ensure previous preview is cleared
    setMapImageBase64('');
    return;
  }
  try {
    console.log('Fetching map image for filename:', filename);
    const data = await PageController.postData('/get_image_data', { filename });
    console.log('get_image_data response:', data);
    const blob = data;
    const reader = new FileReader();
    reader.onloadend = () => {
      setMapImageBase64(reader.result || '');
    };
    reader.readAsDataURL(blob);
  } catch (err) {
    console.error('Failed to load map image:', err);
    // On error, also clear to avoid showing stale image
    setMapImageBase64('');
  }
};

   

  // --- field-level error helper ---------------------------------------------
  // MODIFIED: Handles multiple error columns (e.g., "X | column1, column2")
  const errorColumns =
    record?.status?.startsWith('X |')
      ? record.status.split('|')[1]?.trim().split(',').map(s => s.trim())
      : [];

      // Only keep error flags for fields that are STILL empty now
const activeErrorColumns = Array.isArray(errorColumns)
  ? errorColumns.filter((f) => {
      const v = (formData && formData[f]) ?? '';
      return String(v).trim() === '';
    })
  : [];

  // --- fetch transportation dropdown ----------------------------------------
  useEffect(() => {
    const fetchTransportationOptions = async () => {
      try {
        await PageController.getData('/transportation_options', (data) => {
          setTransportationOptions(data || []);
        });
      } catch (err) {
        console.error('Failed to fetch transportation options:', err);
      }
    };
    fetchTransportationOptions();
  }, []);

  // --- populate form when record changes ------------------------------------
  useEffect(() => {
    if (record) {
       console.log('EditAttendanceModal record:', record);
      setFormData({
        codeofemp: record.codeofemp || '',
        employeename: record.employeename || '',
        dateofcomm: record.dateofcomm ? record.dateofcomm.split('T')[0] : '',
        timeofstart: record.timeofstart || '',
        timeofend: record.timeofend || '',
        dateofstart: record.dateofstart ? record.dateofstart.split('T')[0] : '',
        dateofend: record.dateofend ? record.dateofend.split('T')[0] : '',
        transportation: record.transportation || '',
        startaddress: record.startaddress || '',
        destinationaddress: record.destinationaddress || '',
        vendrservicecid: record.objectid || '',
        distance: record.distance || '',
        linkofmap: record.linkofmap || ''
      });
      setError('');
    }
    fetchMapImage(record?.linkofmap || '');
  }, [record]);

  
 
  // --- ESC key closes modal -------------------------------------------------
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (show) window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [show, onClose]);

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => {
    const updated = { ...prev, [name]: value };
    if (name === 'transportation') {
      const selected = transportationOptions.find(opt => opt.venderservicename === value);
      updated.vendrservicecid = selected ? selected.venderserviceid : '';
    }
    return updated;
  });
};

  // --- form validation flags ------------------------------------------
  const requiredFields = [
    'codeofemp',
    'employeename',
    'dateofcomm',
    'dateofstart',
    'dateofend',
    'transportation',
    'startaddress',
    'destinationaddress',
  ];
  const missingFields = requiredFields.filter((f) => !formData[f]);
  const isFormValid = missingFields.length === 0;
const [showFullImage, setShowFullImage] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (missingFields.length) {
      setError('請填寫所有欄位！');
      setIsLoading(false);
      return;
    }

    try {
      const updated = { ...record, ...formData };
      updated.vendrservicecid = formData.vendrservicecid;
      await EmployeeAttendanceController.updateRecord(updated);
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      setError('更新失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  /* ------------------------------------------------------------------ */
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
          <h3 id="modal-title" className={styles.modalTitle}>
            編輯出勤資料
          </h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.row}>
  <div className={styles.formGroup}>
    <label htmlFor="codeofemp" className={styles.label}>員編：</label>
    <input
      id="codeofemp"
      name="codeofemp"
      className={styles.input}
      value={formData.codeofemp}
      readOnly
    />

  </div>
  <div className={styles.formGroup}>
    <label htmlFor="employeename" className={styles.label}>姓名：</label>
    <input
      id="employeename"
      name="employeename"
      className={styles.input}
      value={formData.employeename}
      readOnly
    />
  </div>
</div>

       

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>開始日期：</label>
              <input
                type="date"
                name="dateofstart"
                className={`${styles.input} ${
                  (!formData.dateofstart || activeErrorColumns.includes('dateofstart'))
                    ? styles.errorInput : ''
                }`}
                value={formData.dateofstart}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>結束日期：</label>
              <input
                type="date"
                name="dateofend"
                className={`${styles.input} ${
                  (!formData.dateofend || activeErrorColumns.includes('dateofend'))
                    ? styles.errorInput
                    : ''
                }`}
                value={formData.dateofend}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
<div className={styles.row}>
  <div className={styles.formGroup}>
    <label className={styles.label}>交通工具：</label>
    <select
      name="transportation"
      className={`${styles.input} ${
        (!formData.transportation || activeErrorColumns.includes('transportation'))
          ? styles.errorInput
          : ''
      }`}
      value={formData.transportation}
      onChange={handleChange}
      disabled={isLoading}
    >
      <option value="">請選擇</option>
      {transportationOptions.map((opt) => (
        <option key={opt.venderserviceid} value={opt.venderservicename}>
          {opt.venderservicename}
        </option>
      ))}
    </select>
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>距離：</label>
    <input
      className={styles.input}
      value={formData.distance}
      readOnly
    />
  </div>
</div>

<div className={styles.row}>
  <div className={styles.formGroup}>
    <label className={styles.label}>出發地：</label>
    <input
      name="startaddress"
      className={`${styles.input} ${
        (!formData.startaddress || activeErrorColumns.includes('startaddress'))
          ? styles.errorInput
          : ''
      }`}
      value={formData.startaddress}
      onChange={handleChange}
      disabled={isLoading}
    />
  </div>
</div>

<div className={styles.row}>
  <div className={styles.formGroup}>
    <label className={styles.label}>目的地：</label>
    <input
      name="destinationaddress"
      className={`${styles.input} ${
        (!formData.destinationaddress || activeErrorColumns.includes('destinationaddress'))
          ? styles.errorInput
          : ''
      }`}
      value={formData.destinationaddress}
      onChange={handleChange}
      disabled={isLoading}
    />
  </div>
</div>
          
        {mapImageBase64 && (
  <>
    <div className={styles.mapImageContainer}>
      <img
        src={mapImageBase64}
        alt="Google Map"
        className={styles.mapPreview}
        onClick={() => setShowFullImage(true)}
      />
    </div>
    {showFullImage && (
      <div className={styles.fullscreenImageOverlay} onClick={() => setShowFullImage(false)}>
        <img src={mapImageBase64} alt="Full Map" className={styles.fullscreenImage} />
      </div>
    )}
  </>
)}

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
            {isFormValid && (
              <button
                type="submit"
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={isLoading}
              >
                {isLoading ? '儲存中...' : '儲存'}
              </button>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
};

EditAttendanceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  record: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    codeofemp: PropTypes.string,
    dateofcomm: PropTypes.string,
    dateofstart: PropTypes.string,
    dateofend: PropTypes.string,
    transportation: PropTypes.string,
    startaddress: PropTypes.string,
    destinationaddress: PropTypes.string,
    status: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

EditAttendanceModal.defaultProps = {
  record: null,
};

export default EditAttendanceModal;