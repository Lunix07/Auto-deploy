import * as React from 'react';
import { Box, Button, CssBaseline, Stepper, Step, StepLabel } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AppTheme from '../../shared-theme/AppTheme';
import Grid from '@mui/material/Grid';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import Fields from '../../components/form/Fields';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance'; 
const steps = ['Fill Form'];

export default function Form(props: { disableCustomTheme?: boolean }) {
  const [activeStep, setActiveStep] = React.useState(0);
  const navigate = useNavigate();

 // ✅ Make sure this exists

const handleNext = async () => {
  if (activeStep === 0) {
    const projectName = (document.getElementById('project-name') as HTMLInputElement).value;
    const githubUrl = (document.getElementById('github-url') as HTMLInputElement).value;
    const githubToken = (document.getElementById('github_token') as HTMLInputElement)?.value || localStorage.getItem("github_token");
    const username = "username";

    const projectData = {
      title: projectName,
      github_url: githubUrl,
      token: githubToken,
    };

    try {
      // ✅ Submit project info to /api/projects/
      const projectRes = await api.post("/api/projects/", projectData);
      console.log("✅ Project submitted:", projectRes.data);

      // ✅ Then, deploy the app using /api/deploy
      if (!githubToken || !username) {
        console.error("❌ Missing GitHub credentials in localStorage or form");
        return;
      }

      const deployData = {
        username: username,
        github_token: githubToken,
        user_repo_url: githubUrl,
        app_name: projectName,
      };

      const deployRes = await api.post("/deploy", deployData);
      console.log("🚀 App deployed:", deployRes.data);

      // ✅ Navigate only after both succeed
      navigate("/dashboard");

    } catch (error) {
      console.error("❌ Error during project submission or deployment:", error);
    }
  } else {
    setActiveStep((prev) => prev + 1);
  }
};

  

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ColorModeIconDropdown />
      </Box>

      <Grid
        container
        justifyContent="center"
        sx={{
          height: '100vh',
          px: { xs: 2, sm: 10 },
          pt: { xs: 4, sm: 16 },
          backgroundColor: 'background.default',
        }}
      >
        <Grid item xs={12} md={8} lg={6} >
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            {activeStep === 0 && <Fields />}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                endIcon={<ChevronRightRoundedIcon />}
                onClick={handleNext}
              >
                Deploy your app
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
