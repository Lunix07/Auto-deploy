import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';

const columns: GridColDef[] = [
  { field: 'title', headerName: 'Projects', width: 500 },
  { field: 'github_url', headerName: 'GitHub URL', width: 500 },
];



export default function MainGrid() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState<any[]>([]);

  // ✅ Load data from localStorage on mount
  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('projects') || '[]');
    const rowsWithId = stored.map((row: any, index: number) => ({
      id: index + 1,
      ...row,
    }));
    setRows(rowsWithId);
  }, []);

  return (
    <Box sx={{ height: 600, width: '100%', backgroundColor: 'background.paper', p: 2,  }}>
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

      <DataGridPro
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
