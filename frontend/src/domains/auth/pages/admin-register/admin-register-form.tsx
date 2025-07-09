import * as React from 'react';
import { Stack, TextField } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { AdminRegisterRequest } from '../../types';

type AdminRegisterFormProps = {
  onSubmit: () => void;
  methods: UseFormReturn<AdminRegisterRequest>;
  isFetching: boolean;
};

export const AdminRegisterForm: React.FC<AdminRegisterFormProps> = ({ onSubmit, methods, isFetching }) => {
  const {
    register,
    formState: { errors }
  } = methods;

  return (
    <form onSubmit={onSubmit}>
      <div>
        <TextField
          size='small'
          type='text'
          label='Full Name'
          sx={{ margin: '30px 0 15px 0' }}
          fullWidth
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </div>
      <div>
        <TextField
          size='small'
          type='email'
          label='Email Address'
          sx={{ marginBottom: '15px' }}
          fullWidth
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
      </div>
      <div>
        <TextField
          size='small'
          type='password'
          label='Password'
          sx={{ marginBottom: '15px' }}
          fullWidth
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
      </div>
      <div>
        <TextField
          size='small'
          type='password'
          label='Confirm Password'
          sx={{ marginBottom: '30px' }}
          fullWidth
          {...register('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
      </div>
      <Stack>
        <LoadingButton loading={isFetching} type='submit' size='small' variant='contained'>
          <span>Register Admin</span>
        </LoadingButton>
      </Stack>
    </form>
  );
};
