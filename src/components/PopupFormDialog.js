// components/PopupFormDialog.js
/* eslint-disable */
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const PopupFormDialog = ({
  open,
  onClose,
  popupFormData,
  setPopupFormData,
  handleSubmitFactor,
  levels,
  units
}) => {

  // Function to handle form input changes
  const handleInputChange = (e, field) => {
    setPopupFormData({ ...popupFormData, [field]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>自訂係數 (Customize Factor)</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth label="設備類別 (Category of Asset)" value={popupFormData.category} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="製程 (Process)" value={popupFormData.process} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="添加物 (Object)" value={popupFormData.object} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="排放氣體 (Gas)" value={popupFormData.gas} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="係數提供商 (Factor Provider)"
              value={popupFormData.factorProvider}
              onChange={(e) => handleInputChange(e, 'factorProvider')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="係數版本 (Version)"
              value={popupFormData.version}
              onChange={(e) => handleInputChange(e, 'version')}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>係數等級 (Level)</InputLabel>
              <Select
                value={popupFormData.level}
                onChange={(e) => handleInputChange(e, 'level')}
              >
                {levels.map((level) => (
                  <MenuItem key={level.uuid} value={level.uuid}>
                    {level.code} - {level.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={popupFormData.unit}
                onChange={(e) => handleInputChange(e, 'unit')}
              >
                {units.map((unit) => (
                  <MenuItem key={unit.unitid} value={unit.unitid}>
                    {unit.unitname} - {unit.unittypename}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="係數 (Factor)"
              value={popupFormData.factor}
              onChange={(e) => handleInputChange(e, 'factor')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="係數說明 (Description of Factor)"
              value={popupFormData.description}
              onChange={(e) => handleInputChange(e, 'description')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleSubmitFactor} color="primary" variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupFormDialog;