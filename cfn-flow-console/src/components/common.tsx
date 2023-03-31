import MuiAlert, { AlertProps as MuiAlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import * as React from 'react';

import { useAppDispatch, useAppSelector } from '../hooks';
import { selectAlert, setAlert } from '../stores/common';

const Alert = React.forwardRef<HTMLDivElement, MuiAlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


export const AlertSnackbar: React.FC = () => {
  const dispatch = useAppDispatch()
  const alert = useAppSelector(selectAlert)

  const handleAlertClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    dispatch(setAlert(({opened: false, message: null, persist: 5000, severity: "success"})))
  }
  return (
    <Snackbar
      open={alert.opened}
      autoHideDuration={alert.persist}
      onClose={handleAlertClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
        {alert.message}
      </Alert>
    </Snackbar>

  )

}
