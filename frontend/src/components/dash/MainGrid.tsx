import { DataGrid, GridColDef } from '@mui/x-data-grid'; // ✅ Changed from DataGridPro
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';

const columns: GridColDef[] = [
  { field: 'title', headerName: 'Projects', width: 500 },
  { field: 'github_url', headerName: 'GitHub URL', width: 500 },
];

interface MainGridProps {
  projects: { title: string; github_url: string; _id?: string }[];
}

export default function MainGrid({ projects }: MainGridProps) {
  const navigate = useNavigate();

  const rows = projects.map((p, index) => ({
    id: p._id || index,
    title: p.title,
    github_url: p.github_url,
  }));

  return (
    <Box sx={{ height: 600, width: '100%', backgroundColor: 'background.paper', p: 2 }}>
      {/* ✅ Top-right aligned button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/form')}
        >
          Deploy New App
        </Button>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'hsla(222, 81.60%, 49.00%, 0.30)',
            color: '#ffffff',
            fontWeight: 600,
            borderBottom: '1px solid #555',
          },
        }}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
