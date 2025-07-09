import * as React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

import { AdminRegisterRequest, AdminRegisterSchema } from '../../types';
import { AdminRegisterForm } from './admin-register-form';
import { useRegisterAdminMutation } from '../../api/auth-api';
import { formatApiError } from '@/utils/helpers/format-api-error';
import { ApiError } from '@/components/errors';

export const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const methods = useForm<AdminRegisterRequest>({ resolver: zodResolver(AdminRegisterSchema) });
  const [apiErrors, setApiErrors] = React.useState<string[]>([]);
  const [successMessage, setSuccessMessage] = React.useState<string>('');

  const [registerAdmin, { isLoading }] = useRegisterAdminMutation();

  const onSubmit = async (data: AdminRegisterRequest) => {
    try {
      setApiErrors([]);
      setSuccessMessage('');
      const result = await registerAdmin(data).unwrap();
      if (result) {
        setSuccessMessage(result.message);
        methods.reset();
      }
    } catch (error) {
      const apiErrors = formatApiError(error as FetchBaseQueryError | SerializedError);
      setApiErrors(apiErrors);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth/login');
  };

  return (
    <Box
      component={Paper}
      sx={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 40px)'
      }}
    >
      <Box
        sx={{
          width: { xs: '350px', md: '450px' },
          border: '1px solid #f3f6f999',
          padding: '20px'
        }}
      >
        <Typography component='div' variant='h6'>
          Register New Admin
        </Typography>
        <Typography variant='subtitle1' color='text.secondary'>
          Create a new administrator account.
        </Typography>

        {successMessage && (
          <Box
            sx={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              color: '#155724',
              padding: '12px',
              borderRadius: '4px',
              margin: '20px 0'
            }}
          >
            <Typography variant='body2'>{successMessage}</Typography>
          </Box>
        )}

        <AdminRegisterForm
          methods={methods}
          onSubmit={methods.handleSubmit(onSubmit)}
          isFetching={isLoading}
        />

        <ApiError messages={apiErrors} />

        <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
          <Button
            variant='text'
            size='small'
            onClick={handleBackToLogin}
            sx={{ textTransform: 'none' }}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
