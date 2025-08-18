import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic from Next.js
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import TranslateIcon from '@mui/icons-material/Translate';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import i18n from '../i18n';
import { useAuth } from '../components/AuthContext';
import { useGlobalContext } from '../components/GlobalContext';
import * as PageController from '../controllers/PageControllers';
import Chat from "../pages/Chat";
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const BubbleChat = dynamic(() => import('flowise-embed-react').then(mod => mod.BubbleChat), {
  ssr: false, // Prevents Next.js from trying to render on the server
});

const Layout = ({ children }) => {
  const { t } = useTranslation();
  const {
    token,
    logout,
    profile,
    personId
  } = useAuth();

  const {
    globalCompanyId,
    setGlobalCompanyId,
    globalOrgId,
    setGlobalOrgId,
    companyList,
    setCompanyList,
    organizationList,
    setOrganizationList
  } = useGlobalContext();
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [menuItems, setMenuItems] = useState([]); // Initialize menuItems as an empty array
  const [rows, setRows] = useState([]);

  // ---- Persist selections across refresh (per user) ----
  const isBrowser = typeof window !== 'undefined';
  const getLS = (key) => (isBrowser ? window.localStorage.getItem(key) : null);
  const setLS = (key, val) => { if (isBrowser) window.localStorage.setItem(key, val); };
  const rmLS = (key) => { if (isBrowser) window.localStorage.removeItem(key); };
  const storagePrefix = `eztracker:${personId || 'anon'}`;
  const COMPANY_KEY = `${storagePrefix}:companyId`;
  const ORG_KEY = `${storagePrefix}:orgId`;

  const endpoint = `/api/menu?personid=${personId}`;

  const handleLanguageMenuOpen = (event) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchor(null);
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    handleLanguageMenuClose();
  };

  const fetchOrganizations = async (companyId, { tryRestoreOrg = false } = {}) => {
    try {
      await PageController.getData(
        `/f000110e30/organizations?personid=${personId}&companyId=${companyId}`,
        (data) => {
          const list = data || [];
          setOrganizationList(list);
          if (tryRestoreOrg) {
            const storedOrg = getLS(ORG_KEY);
            if (storedOrg && list.some(o => o.organizationid === storedOrg)) {
              setGlobalOrgId(storedOrg);
            } else if (!globalOrgId && list.length > 0) {
              setGlobalOrgId(list[0].organizationid);
            }
          }
        },
        { companyId, personid: personId }
      );
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };
  const fetchCompanies = async () => {
    try {
      await PageController.getData(
        `/f000110e30/companies?personid=${personId}`,
        (data) => {
          const list = data || [];
          setCompanyList(list);
          // Try to restore company selection from LS if none selected
          const storedCompany = getLS(COMPANY_KEY);
          if (!globalCompanyId && list.length > 0) {
            if (storedCompany && list.some(c => c.companyid === storedCompany)) {
              setGlobalCompanyId(storedCompany);
              // Also fetch orgs and try to restore org
              fetchOrganizations(storedCompany, { tryRestoreOrg: true });
            } else {
              const firstCompany = list[0];
              setGlobalCompanyId(firstCompany.companyid);
              fetchOrganizations(firstCompany.companyid, { tryRestoreOrg: true });
            }
          }
        },
        { personid: personId }
      );
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };
  const fetchMenuItems = async () => {
      if (!token) return;

      try {
        PageController.getData(endpoint, (data) => {
          if (!data || data.length === 0) {
            logout();
            return;
          }
          setRows(data);
          setMenuItems(data);
        });
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

  // Initial load: fetch menu + companies (restores saved company/org if present)
  useEffect(() => {
    if (!token) return;
    const initialize = async () => {
      await fetchMenuItems();
      await fetchCompanies(); // handles restore + org fetch internally
    };
    initialize();
  }, [token, personId]);

  // Persist selections when they change
  useEffect(() => {
    if (globalCompanyId) {
      setLS(COMPANY_KEY, globalCompanyId);
    }
  }, [globalCompanyId]);
  useEffect(() => {
    if (globalOrgId) {
      setLS(ORG_KEY, globalOrgId);
    }
  }, [globalOrgId]);
  
  // If the company list changes and current selection is invalid, fix it
  useEffect(() => {
    if (companyList?.length) {
      if (!globalCompanyId || !companyList.some(c => c.companyid === globalCompanyId)) {
        const stored = getLS(COMPANY_KEY);
        const next = (stored && companyList.some(c => c.companyid === stored))
          ? stored
          : companyList[0]?.companyid;
        if (next && next !== globalCompanyId) {
          setGlobalCompanyId(next);
          fetchOrganizations(next, { tryRestoreOrg: true });
        }
      }
    }
  }, [companyList]);
  
  // If the org list changes and current selection is invalid, fix it
  useEffect(() => {
    if (organizationList?.length && globalCompanyId) {
      if (!globalOrgId || !organizationList.some(o => o.organizationid === globalOrgId)) {
        const stored = getLS(ORG_KEY);
        const next = (stored && organizationList.some(o => o.organizationid === stored))
          ? stored
          : organizationList[0]?.organizationid;
        if (next && next !== globalOrgId) {
          setGlobalOrgId(next);
        }
      }
    }
  }, [organizationList, globalCompanyId]);

  

  // Guard Select values against out-of-range values
  const safeCompanyValue = (companyList || []).some(c => c.companyid === globalCompanyId) ? globalCompanyId : '';
  const safeOrgValue = (organizationList || []).some(o => o.organizationid === globalOrgId) ? globalOrgId : '';

  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
        <Toolbar>
          {/* Menu Icon and App Title */}
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mr: 2 }}>
  EZ Tracker
</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
              <Select
                displayEmpty
                value={safeCompanyValue}
                onChange={(e) => {
                  const nextCompany = e.target.value;
                  setGlobalCompanyId(nextCompany);
                  setLS(COMPANY_KEY, nextCompany);
                  // Reset org selection (and its LS) because company changed
                  setGlobalOrgId('');
                  rmLS(ORG_KEY);
                  setOrganizationList([]);
                  fetchOrganizations(nextCompany, { tryRestoreOrg: true });
                }}
              >
                <MenuItem value=""><em>{t('Select Company')}</em></MenuItem>
                {(companyList || []).map((comp) => (
                  <MenuItem key={comp.companyid} value={comp.companyid}>
                    {comp.companyname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150, mr: 2 }} disabled={!globalCompanyId}>
              <Select
                displayEmpty
                value={safeOrgValue}
                onChange={(e) => {
                  setGlobalOrgId(e.target.value);
                  setLS(ORG_KEY, e.target.value);
                }}
              >
                <MenuItem value=""><em>{t('Select Organization')}</em></MenuItem>
                {(organizationList || []).map((org) => (
                  <MenuItem key={org.organizationid} value={org.organizationid}>
                    {org.organization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton color="inherit" onClick={handleLanguageMenuOpen}>
              <TranslateIcon />
            </IconButton>
            <Typography variant="body1" sx={{ ml: 1 }}>
              {currentLanguage.toUpperCase()}
            </Typography>
            <Menu
              anchorEl={languageAnchor}
              open={Boolean(languageAnchor)}
              onClose={handleLanguageMenuClose}
            >
              <MenuItem onClick={() => handleLanguageChange('zh-TW')}>中文 (Chinese)</MenuItem>
              <MenuItem onClick={() => handleLanguageChange('en-US')}>English</MenuItem>
              <MenuItem onClick={() => handleLanguageChange('ja-JP')}>日本語 (Japanese)</MenuItem>
            </Menu>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton edge="end" color="inherit">
                <AccountCircle />
              </IconButton>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {profile?.name || 'User'}
              </Typography>
            </Box>

            <Button onClick={logout} variant="outlined" color="primary" sx={{ ml: 2 }}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Layout */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ width: '180px', backgroundColor: '#0000000D', padding: '20px' }}>
          <List>
            {menuItems.map((item, index) => (
              <Link key={index} href={item.path} passHref>
                <ListItem button component="a">
                  <ListItemText
                    primary={t(item.label)}
                    primaryTypographyProps={{
                      sx: {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      },
                    }}
                  />
                </ListItem>
              </Link>
            ))}
          </List>
        </div>

        {/* Content Area */}
        <div style={{ flexGrow: 1, padding: '20px' }}>
          {children}
        </div>
      </div>

   {/* Chatbot (Only loads in browser) */}
<Chat user={profile?.name || "Guest"} />
    </div>
  );
};

export default Layout;