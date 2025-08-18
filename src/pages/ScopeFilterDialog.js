import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import axios from 'axios';

const ScopeFilterDialog = ({ open, onClose, onApply, onClear }) => {
  const [scopeGroups, setScopeGroups] = useState({});
  const [selectedScopes, setSelectedScopes] = useState([]);

  useEffect(() => {
    const fetchScopeGroups = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scopedetails`);
        const groupedScopes = response.data.reduce((groups, item) => {
          Object.entries(item).forEach(([scope, details]) => {
            if (!groups[scope]) groups[scope] = [];
            groups[scope].push({ id: details.lidofdescofiso, name: scope });
          });
          return groups;
        }, {});
        setScopeGroups(groupedScopes);
      } catch (error) {
        console.error('Error fetching scope details:', error);
      }
    };
    fetchScopeGroups();
  }, []);

  const handleScopeChange = (scopeId) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId]
    );
  };

  const handleApply = () => {
    onApply(selectedScopes);
    onClose();
  };

  const handleClear = () => {
    setSelectedScopes([]);
    onClear();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Filter by Scope</DialogTitle>
      <DialogContent>
        {Object.entries(scopeGroups).map(([scope, items]) => (
          <Box key={scope} sx={{ mb: 2 }}>
            <Typography variant="h6">{scope}</Typography>
            {items.map((item) => (
              <FormControlLabel
                key={item.id}
                control={
                  <Checkbox
                    checked={selectedScopes.includes(item.id)}
                    onChange={() => handleScopeChange(item.id)}
                  />
                }
                label={item.name}
              />
            ))}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} color="secondary">
          Clear
        </Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScopeFilterDialog;