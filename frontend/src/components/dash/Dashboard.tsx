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


const xThemeComponents = {};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline />

      <Box sx={{ display: 'flex' }}>
        {/* Sidebar (fixed width) */}
        <SideMenu />

        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: '240px', // add margin to avoid overlap with SideMenu
            p: 3,
          }}
        >
          <AppNavbar />
          <Header />
          <MainGrid />
        </Box>
      </Box>
    </AppTheme>
  );
}
