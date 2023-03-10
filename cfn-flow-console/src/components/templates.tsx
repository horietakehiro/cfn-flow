import * as React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import RefreshIcon from '@mui/icons-material/Refresh';
import { Divider, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FileUploadIcon from '@mui/icons-material/FileUpload';

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
  { ...createData('Template1', "https://example.com/template1.yaml", "s3://example/template1.yaml", "2023-03-01T10:00:00+0900", "-"), id: 1 },
  { ...createData('Template2', "https://example.com/template2.yaml", "s3://example/template2.yaml", "2023-03-01T10:00:00+0900", "2023-03-02T10:00:00+0900"), id: 2 },
];





export const TemplatesMainMenu: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Stack direction={"row"}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant='h6'>CloudFromation Templates</Typography>
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

export const TemplatesTable: React.FC = () => {
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
const CreateTemplateDialog: React.FC<CreateDialogProps> = ({ dialogOpen, setDialogOpen }) => {
  // const [open, setOpen] = React.useState(false);
  enum TemplateSourceType {
    S3 = 1,
    Local = 2
  }
  const [templateSourceType, setTemplateSourceType] = React.useState(TemplateSourceType.S3)
  const [localFile, setLocalFile] = React.useState("")


  const onTemplateSourceTypehange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateSourceType(Number(e.target.value))
  }
  const onSelectLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      setLocalFile(e.target.files[0].name )
    }
  }

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <div>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>New Template</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Template Name"
            type={"tex"}
            fullWidth
            variant="outlined"
          />
          <TextField
            autoFocus
            margin="normal"
            id="description"
            label="Description"
            type={"tex"}
            fullWidth
            variant="outlined"
            multiline
          />

          <FormControl>
            <FormLabel id="template-source">Template source</FormLabel>
            <RadioGroup
              row
              aria-labelledby="template-source"
              name="row-radio-buttons-group"
              onChange={onTemplateSourceTypehange} 
            >
              <FormControlLabel
                value={TemplateSourceType.S3}
                control={<Radio />}
                label="Amazon S3 URL"
                checked={templateSourceType === TemplateSourceType.S3}
              />
              <FormControlLabel
                value={TemplateSourceType.Local}
                control={<Radio />}
                label="Upload local file"
                checked={templateSourceType === TemplateSourceType.Local}
              />
            </RadioGroup>
          </FormControl>
          {templateSourceType === TemplateSourceType.S3
            ?
            <Stack direction={"row"} spacing={2}>
            <TextField
              autoFocus
              margin="normal"
              id="url"
              label="Template URL"
              type={"url"}
              fullWidth
              variant="outlined"
            />
            </Stack>
            :
            <Stack direction={"row"} spacing={2}>
            <Stack direction={"row"} spacing={2}>
            <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
              Upload
              <input  hidden accept=".json,.yaml" multiple={false} type="file" onChange={onSelectLocalFile}/>
            </Button>
            <Typography>{localFile}</Typography>
            </Stack>
            </Stack>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>CANCEL</Button>
          <Button onClick={handleClose}>CREATE</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
