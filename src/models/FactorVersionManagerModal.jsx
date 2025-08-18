import React, { useEffect, useState, useCallback  } from 'react';
import { Dialog,  DialogTitle,  DialogContent,  DialogActions,  Button,  CircularProgress,  Table,  TableHead,  TableBody,  TableRow,  TableCell,  IconButton,  Box,  TextField,  MenuItem,  Select,  InputLabel,  FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useGlobalContext } from '../components/GlobalContext';
const FactorVersionManagerModal = ({ open, onClose, vendorId, scopeId, serviceId }) => {
  const { globalCompanyId, globalOrgId } = useGlobalContext();
  const globalCountryId = '92e19c8a-c867-40c3-a0ad-d70c0c143045';
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 5;
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [newVersionName, setNewVersionName] = useState('');
  const [levelOptions, setLevelOptions] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingData, setEditingData] = useState(null);


  const refreshVersions = useCallback(async () => {
    try {
      const res = await fetch(`${baseURL}/scope3_getversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idofvender: vendorId,
          idofscope: scopeId,
          idofservice: serviceId,
          idofcompany: globalCompanyId,
          idoforg: globalOrgId,
          idofcountry: globalCountryId
        })
      });
      const data = await res.json();
      setVersions(data);
      setCurrentPage(0); // Reset to first page
    } catch (err) {
      console.error("Failed to refresh versions", err);
      setVersions([]);
    }
  }, [vendorId, scopeId, serviceId]);

  const fetchLevelOptions = async () => {
    try {
      const res = await fetch(`${baseURL}/icx_dropdown_leveloffactor`);
      const data = await res.json();
      setLevelOptions(data);
    } catch (err) {
      console.error("Failed to fetch level options", err);
    }
  };

  useEffect(() => {
    if (!open || !vendorId || !scopeId || !serviceId) return;

    setLoading(true);
    refreshVersions().finally(() => setLoading(false));
    fetchLevelOptions();
  }, [open, vendorId, scopeId, serviceId, refreshVersions]);

  const handleCreateVersion = async () => {
    try {
      const res = await fetch(`${baseURL}/scope3_add_version`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pkgversion: newVersion,
          pkgname: newVersionName,
          idofvender: vendorId,
          idofscope: scopeId,
          idofservice: serviceId,
          idofcompany: globalCompanyId,
          idoforg: globalOrgId,
          idofcountry: globalCountryId,
          idofleveloffactor: selectedLevel
        })
      });
      if (res.ok) {
        alert('版本新增成功');
        setShowCreateDialog(false);
        setNewVersion('');
        setNewVersionName('');
        setSelectedLevel('');
        await refreshVersions();
      } else {
        alert('版本新增失敗');
      }
    } catch (err) {
      console.error('Failed to add version', err);
      alert('版本新增時發生錯誤');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>係數版本管理</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreateDialog(true)}>
            新增版本
          </Button>
        </Box>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>版本</TableCell>
                <TableCell>版本名稱</TableCell>
                <TableCell>係數等級</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {versions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">無資料</TableCell>
                </TableRow>
              ) : (
                versions
                .slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage)
                .map((v, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{v.pkgversion}</TableCell>
                    <TableCell>{v.pkgname}</TableCell>
                    <TableCell>{v.nameofleveloffactor}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const matchedOption = levelOptions.find(
                            (opt) => opt.nameofleveloffactor === v.nameofleveloffactor
                          );
                          if (matchedOption) {
                            setEditingData({
                              ...v,
                              idofleveloffactor: matchedOption.idofleveloffactor
                            });
                          } else {
                            setEditingData(v);
                          }
                          setShowEditDialog(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => alert(`功能未開放`)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            上一頁
          </Button>
          <Box mx={2}>{currentPage + 1} / {Math.ceil(versions.length / rowsPerPage)}</Box>
          <Button
            onClick={() =>
              setCurrentPage((prev) =>
                prev + 1 < Math.ceil(versions.length / rowsPerPage) ? prev + 1 : prev
              )
            }
            disabled={currentPage + 1 >= Math.ceil(versions.length / rowsPerPage)}
          >
            下一頁
          </Button>
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>關閉</Button>
      </DialogActions>

{/* Create Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
        <DialogTitle>新增版本</DialogTitle>
        <DialogContent>
          <TextField
            label="版本"
            fullWidth
            value={newVersion}
            onChange={(e) => setNewVersion(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="版本名稱"
            fullWidth
            value={newVersionName}
            onChange={(e) => setNewVersionName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>係數等級</InputLabel>
            <Select
              value={selectedLevel || ''}
              label="係數等級"
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levelOptions.map((option) => (
                <MenuItem key={option.idofleveloffactor} value={option.idofleveloffactor}>
                  {option.nameofleveloffactor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateVersion}>確定新增</Button>
        </DialogActions>
      </Dialog>

{/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}>
        <DialogTitle>編輯版本</DialogTitle>
        <DialogContent>
          <TextField
            label="版本"
            fullWidth
            value={editingData?.pkgversion || ''}
            onChange={(e) =>
              setEditingData({ ...editingData, pkgversion: e.target.value })
            }
            sx={{ mt: 2 }}
          />
          <TextField
            label="版本名稱"
            fullWidth
            value={editingData?.pkgname || ''}
            onChange={(e) =>
              setEditingData({ ...editingData, pkgname: e.target.value })
            }
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>係數等級</InputLabel>
            <Select
              value={editingData?.idofleveloffactor || ''}
              label="係數等級"
              onChange={(e) =>
                setEditingData({ ...editingData, idofleveloffactor: e.target.value })
              }
            >
              {levelOptions.map((option) => (
                <MenuItem key={option.idofleveloffactor} value={option.idofleveloffactor}>
                  {option.nameofleveloffactor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const res = await fetch(`${baseURL}/scope3_update_versionmanager`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    pkgid: editingData.pkgid,
                    pkgversion: editingData.pkgversion,
                    pkgname: editingData.pkgname,
                    idofvender: vendorId,
                    idofscope: scopeId,
                    idofservice: serviceId,
                    idofcompany: globalCompanyId,
                    idoforg: globalOrgId,
                    idofcountry: globalCountryId,
                    idofleveloffactor: editingData.idofleveloffactor
                  })
                });

                if (res.ok) {
                  alert('版本更新成功');
                  setShowEditDialog(false);
                  setEditingData(null);
                  await refreshVersions();
                } else {
                  alert('版本更新失敗');
                }
              } catch (err) {
                console.error('Update failed', err);
                alert('更新時發生錯誤');
              }
            }}
          >
            確定更新
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default FactorVersionManagerModal;
