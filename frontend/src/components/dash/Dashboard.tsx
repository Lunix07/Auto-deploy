import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppNavbar from '../../components/dash/AppNavbar';
import Header from '../../components/dash/Header';
import AppTheme from '../../shared-theme//AppTheme';
import SideMenu from '../../components/dash/SideMenu';
import MainGrid from '../../components/dash/MainGrid';
import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';

const xThemeComponents = {};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const fetchProjects = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await api.get("/api/projects", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              userId: parsedUser.id,
            },
          });
          setProjects(res.data.projects);
        } catch (err) {
          console.error("❌ Failed to fetch user projects", err);
        }
      };

      fetchProjects();
    }
  }, []);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: '240px',
            p: 3,
          }}
        >
          <AppNavbar />
          <Header />
          <MainGrid projects={projects} />
        </Box>
      </Box>
    </AppTheme>
  );
}
