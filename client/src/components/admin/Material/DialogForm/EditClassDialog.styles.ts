import { styled } from '@mui/material/styles';
import { FormControl } from '@mui/material';

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
}));