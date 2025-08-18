import { toast } from 'react-toastify';
import React, { useState } from 'react';
import { deleteRecord, updateRecord } from '../controllers/PageControllers';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
} from '@mui/material';

const DeleteAttendanceModal = ({ open, onClose, onSuccess, year, month }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!year || !month) {
      toast.warning('⚠️ 請選擇年份與月份');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateRecord('/delete_employe_attendance', null, { year, month });
      onClose();
      if (typeof onSuccess === 'function') {
        onSuccess();
        toast.success('✅ 刪除成功');
      }
    } catch (err) {
      console.error('❌ 刪除時發生錯誤:', err);
      toast.error('❌ 刪除失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

 
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>選擇年份與月份</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, px: 4, py: 3 }}>
        <TextField
          label="年份"
          value={year}
          fullWidth
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="月份"
          value={month}
          fullWidth
          InputProps={{ readOnly: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>取消</Button>
        <Button onClick={handleDelete} disabled={isSubmitting} color="error">
          確認刪除
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAttendanceModal;