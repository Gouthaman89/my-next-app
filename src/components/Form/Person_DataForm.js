// src/components/Form/Person_DataForm.js

import React from 'react';
import { Box, Button, TextField, Checkbox, FormControlLabel, MenuItem } from '@mui/material';

const PersonDataForm = ({ fields, values, onChange, onSubmit, personId }) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fields.map((field) => (
        <div key={field.name}>
          {field.type === 'checkbox' ? (
            <FormControlLabel
              control={
                <Checkbox
                  name={field.name}
                  checked={Boolean(values[field.name])} // Ensures it's a boolean
                  onChange={(e) =>
                    onChange({
                      target: { name: field.name, value: e.target.checked },
                    })
                  }
                  sx={{ color: 'primary.main' }}
                />
              }
              label={field.label}
            />
          ) : field.type === 'dropdown' ? (
            <TextField
              select
              label={field.label}
              name={field.name}
              value={values[field.name] || ''}
              onChange={onChange}
              required={field.required}
              fullWidth
            >
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label={field.label}
              name={field.name}
              type={field.type || 'text'}
              value={values[field.name] || ''}
              onChange={onChange}
              required={field.required}
              fullWidth
              disabled={
                (field.name === 'tel' || field.name === 'email') &&
                values.id &&
                String(values.id) === String(personId) // Disable condition
              }
            />
          )}
        </div>
      ))}
      <Button variant="contained" type="submit">
        Submit
      </Button>
    </Box>
  );
};

export default PersonDataForm;