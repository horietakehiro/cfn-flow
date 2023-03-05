import * as React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import RefreshIcon from '@mui/icons-material/Refresh';
import { Divider } from '@mui/material';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { DataGrid, GridColDef } from '@mui/x-data-grid';


function createData(
  Name: string,
  HttpURL: string,
  S3URL: string,
  CreateAt: string,
  UpdateAt: string,
) {
  return { Name, HttpURL, S3URL, CreateAt, UpdateAt };
}

const columns: GridColDef[] = [
  {
    field: "Name", headerName: "Name", width: 200, align: "left",
  },
  {
    field: "HttpURL", headerName: "HttpURL", width: 200, align: "left",
  },
  {
    field: "S3URL", headerName: "S3URL", width: 200, align: "left",
  },
  {
    field: "CreateAt", headerName: "CreateAt", width: 200, align: "left",
  },
  {
    field: "UpdateAt", headerName: "UpdateAt", width: 200, align: "left",
  },

]
const rows = [
  {...createData('Template1', "https://example.com/template1.yaml", "s3://example/template1.yaml", "2023-03-01T10:00:00+0900", "-"), id: 1},
  {...createData('Template2', "https://example.com/template2.yaml", "s3://example/template2.yaml", "2023-03-01T10:00:00+0900", "2023-03-02T10:00:00+0900"), id: 2},
];



// const Item = styled(Paper)(({ theme }) => ({
//   backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: 'center',
//   color: theme.palette.text.secondary,
// }));

// const Search = styled('div')(({ theme }) => ({
//   position: 'relative',
//   border: "0.5px solid",
//   borderRadius: theme.shape.borderRadius,
//   backgroundColor: alpha(theme.palette.common.white, 0.15),
//   '&:hover': {
//     backgroundColor: alpha(theme.palette.common.white, 0.25),
//   },
//   marginLeft: 0,
//   width: '100%',
//   [theme.breakpoints.up('sm')]: {
//     marginLeft: theme.spacing(1),
//     width: 'auto',
//   },
// }));

// const SearchIconWrapper = styled('div')(({ theme }) => ({
//   padding: theme.spacing(0, 2),
//   height: '100%',
//   position: 'absolute',
//   pointerEvents: 'none',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
// }));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//   color: 'inherit',
//   '& .MuiInputBase-input': {
//     padding: theme.spacing(1, 1, 1, 0),
//     // vertical padding + font size from searchIcon
//     paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//     transition: theme.transitions.create('width'),
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//       width: '12ch',
//       '&:focus': {
//         width: '20ch',
//       },
//     },
//   },
// }));



export const TemplatesMainMenu: React.FC =() => {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Stack direction={"row"}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              CloudFromation Templates
            </Grid>
            <Grid item xs={8}>
              <Stack spacing={2} direction="row" justifyContent={"flex-end"}>
                <Button variant="outlined" style={{ textTransform: 'none' }}><RefreshIcon /></Button>
                <Button variant="outlined" style={{ textTransform: 'none' }}>View details</Button>
                <Button variant="outlined" style={{ textTransform: 'none' }}>Edit</Button>
                <Button variant="outlined" style={{ textTransform: 'none' }}>Delete</Button>
                <Button 
                  variant="contained"
                  style={{ textTransform: 'none' }}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
        <Divider />
        <TemplatesTable />
        <CreateTemplateDialog
          dialogOpen={createDialogOpen}
          setDialogOpen={setCreateDialogOpen}
        />
      </Stack>
    </Box >
  );
}

export const TemplatesTable: React.FC =() => {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10,
          },
        },
      }}
      pageSizeOptions={[10]}
      // checkboxSelection
    />
    </ Box>
  );
}


interface CreateDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const CreateTemplateDialog: React.FC<CreateDialogProps> = ({dialogOpen, setDialogOpen}) => {
  // const [open, setOpen] = React.useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <div>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Subscribe</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
