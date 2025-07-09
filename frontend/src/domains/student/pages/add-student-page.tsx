import { Button, Paper, Stack } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

import { PageContentHeader } from '@/components/page-content-header';
import { getErrorMsg } from '@/utils/helpers/get-error-message';
import { API_DATE_FORMAT, getFormattedDate } from '@/utils/helpers/date';
import { useAddStudentMutation } from '../api/student-api';
import { StudentProps, StudentSchema } from '../types';
import { studentFormInitialState } from '../reducer';
import {
  AcademicInformation,
  AddressInformation,
  BasicInformation,
  OtherInformation,
  ParentsAndGuardianInformation
} from '../components/forms';

export const AddStudent = () => {
  const [addStudent, { isLoading }] = useAddStudentMutation();

  const navigate = useNavigate();

  const methods = useForm<StudentProps>({
    defaultValues: studentFormInitialState,
    resolver: zodResolver(StudentSchema)
  });

  const onReset = () => {
    methods.reset();
  };

  const onSave = async (data: StudentProps) => {
    try {
      console.log('🔵 Frontend: Raw form data:', JSON.stringify(data, null, 2));

      const { dob, admissionDate, ...rest } = data;

      const payload = {
        ...rest,
        dob: getFormattedDate(dob, API_DATE_FORMAT),
        admissionDate: getFormattedDate(admissionDate, API_DATE_FORMAT)
      };

      console.log('🔵 Frontend: Processed payload:', JSON.stringify(payload, null, 2));
      console.log('🔵 Frontend: Payload field types:', {
        name: typeof payload.name,
        email: typeof payload.email,
        phone: typeof payload.phone,
        gender: typeof payload.gender,
        dob: typeof payload.dob,
        class: typeof payload.class,
        section: typeof payload.section,
        roll: typeof payload.roll,
        admissionDate: typeof payload.admissionDate,
        currentAddress: typeof payload.currentAddress,
        permanentAddress: typeof payload.permanentAddress,
        fatherName: typeof payload.fatherName,
        guardianName: typeof payload.guardianName,
        guardianPhone: typeof payload.guardianPhone,
        relationOfGuardian: typeof payload.relationOfGuardian,
        systemAccess: typeof payload.systemAccess
      });

      const result = await addStudent(payload).unwrap();
      console.log('🔵 Frontend: Success response:', result);
      toast.info(result.message);
      navigate(`/app/students`);
    } catch (error) {
      console.error('🔴 Frontend: Full error object:', error);
      console.error('🔴 Frontend: Error details:', JSON.stringify(error, null, 2));
      toast.error(getErrorMsg(error as FetchBaseQueryError | SerializedError).message);
    }
  };

  return (
    <>
      <PageContentHeader icon={<AddCircleOutline sx={{ mr: 1 }} />} heading='Add Student' />
      <Paper sx={{ p: 3 }}>
        <FormProvider {...methods}>
          <BasicInformation />

          <hr />
          <AcademicInformation />

          <hr />
          <ParentsAndGuardianInformation />

          <hr />
          <AddressInformation />

          <hr />
          <OtherInformation />

          <hr />
          <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
            <Button
              size='small'
              variant='contained'
              color='error'
              onClick={methods.handleSubmit(onReset)}
            >
              Reset
            </Button>
            <LoadingButton
              loading={isLoading}
              size='small'
              variant='contained'
              color='primary'
              onClick={methods.handleSubmit(onSave)}
            >
              Save
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Paper>
    </>
  );
};
