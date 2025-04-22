import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Grid,
  Link,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        setLoading(true);
        
        // Check if account is locked
        const lockoutStatus = await checkAccountLockout(values.email);
        if (lockoutStatus.isLocked) {
          setError(`Account is locked due to too many failed login attempts. Please try again in ${lockoutStatus.remainingTime} minutes.`);
          return;
        }
        
        await login(values.email, values.password, values.rememberMe);
      } catch (error: any) {
        // Check if error message contains lockout information
        if (error.message && error.message.includes('Account is locked')) {
          setError(error.message);
        } else {
          setError('Failed to log in. Please check your credentials.');
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8,
          borderRadius: '8px',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography 
            component="h1" 
            variant="h5" 
            sx={{ 
              color: '#4C7A4C',
              fontWeight: 500,
              mb: 2
            }}
          >
            Sourdough Bakery App
          </Typography>
          
          <Typography 
            component="h2" 
            variant="h6" 
            sx={{ mb: 3 }}
          >
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <Button 
                    onClick={handleTogglePasswordVisibility}
                    sx={{ minWidth: 'auto', p: 0 }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                ),
              }}
              sx={{ mb: 1 }}
            />
            
            <Grid container sx={{ mb: 2 }}>
              <Grid item xs>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="rememberMe"
                      name="rememberMe"
                      color="primary"
                      checked={formik.values.rememberMe}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Remember me"
                />
              </Grid>
              <Grid item>
                <Link href="/reset-password" variant="body2" sx={{ color: '#4C7A4C' }}>
                  Forgot password?
                </Link>
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 2, 
                mb: 3,
                py: 1.5,
                backgroundColor: '#4C7A4C',
                '&:hover': {
                  backgroundColor: '#3c613c',
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Don't have an account?{' '}
                  <Link href="/signup" sx={{ color: '#4C7A4C', fontWeight: 500 }}>
                    Sign Up
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
