import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function Fields() {
  return (
    <Grid container spacing={3}>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="project-name" required>
          Project Name
        </FormLabel>
        <OutlinedInput
          id="project-name"
          name="project-name"
          type="name"
          placeholder="project name"
          autoComplete="project name"
          required
          size="small"
        />
      </FormGrid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="github-url" required>
          Github URL
        </FormLabel>
        <OutlinedInput
          id="github-url"
          name="github-url"
          type="github-url"
          placeholder="github-url"
          autoComplete="github url"
          required
          size="small"
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="token" required>
          Token
        </FormLabel>
        <OutlinedInput
          id="token"
          name="token"
          type="token"
          placeholder="token"
          autoComplete="token"
          required
          size="small"
        />
      </FormGrid>
      
    </Grid>
  );
}