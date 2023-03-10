import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import RefreshIcon from '@mui/icons-material/Refresh';
import { Container, Divider, Icon, IconButton, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Paper from '@mui/material/Paper';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Routes, Route, NavLink, useLocation, Link as RouterLink, Link, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import CardContent from "@mui/material/CardContent"
import Card from "@mui/material/Card"

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

  var { templateId } = useParams();
  console.log(`templateid ${templateId}`)

  const [detailPageOpen, setDetailPageOpen] = React.useState(false)
  const [selectedTemplate, setSelectedTemplate] = React.useState(templateId ? templateId : "")

  return (
    <Box sx={{ width: '100%' }}>
      {!detailPageOpen || !templateId ?
        <TemplatesTable
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          setDetailPageOpen={setDetailPageOpen}
        /> :
        <TemplatesDetail
          selectedTemplate={selectedTemplate}
        />
      }
    </Box >
  );
}

interface TemplateTableProps {
  selectedTemplate: string;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>
  setDetailPageOpen: React.Dispatch<React.SetStateAction<boolean>>
}
export const TemplatesTable: React.FC<TemplateTableProps> = ({ selectedTemplate, setSelectedTemplate, setDetailPageOpen }) => {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  return (
    <Stack spacing={2}>
      <Stack direction={"row"}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='h6'>{"CloudFromation Templates"}</Typography>
          </Grid>
          <Grid item xs={8}>
            <Stack spacing={2} direction="row" justifyContent={"flex-end"}>
              <Button variant="outlined" style={{ textTransform: 'none' }}><RefreshIcon /></Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => setDetailPageOpen(true)}
                disabled={selectedTemplate === ""}
                component={Link}
                to={selectedTemplate}
              >
                View details
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => setEditDialogOpen(true)}
                disabled={selectedTemplate === ""}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={selectedTemplate === ""}
              >
                Delete
              </Button>
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
          onRowClick={() => setSelectedTemplate("dummy-template")}
        // checkboxSelection
        />
      </Box>

      <EditTemplateDialog
        dialogOpen={editDialogOpen}
        setDialogOpen={setEditDialogOpen}
        selectedTemplate="dummy-template"
      />
      <DeleteTemplateDialog
        dialogOpen={deleteDialogOpen}
        setDialogOpen={setDeleteDialogOpen}
        selectedTemplate="dummy-template"
      />
      <CreateTemplateDialog
        dialogOpen={createDialogOpen}
        setDialogOpen={setCreateDialogOpen}
      />
    </Stack>
  );
}


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
interface TemplateDetailProps {
  selectedTemplate: string;
}
export const TemplatesDetail: React.FC<TemplateDetailProps> = ({ selectedTemplate }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  return (
    <Stack spacing={2}>
      <Stack direction={"row"}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='h6'>{selectedTemplate}</Typography>
          </Grid>
          <Grid item xs={8}>
            <Stack spacing={2} direction="row" justifyContent={"flex-end"}>
              <Button variant="outlined" style={{ textTransform: 'none' }}><RefreshIcon /></Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => setEditDialogOpen(true)}
                disabled={selectedTemplate === ""}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={selectedTemplate === ""}
              >
                Delete
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <Divider />
      <Stack spacing={2} direction={"column"} sx={{}}>
        <Typography variant='h6'>Details</Typography>
        <Box sx={{ width: '100%', }}>
          <Card variant="outlined" sx={{}}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs>
              <Stack direction={"column"} spacing={4}>
                <TextField id="standard-basic" label="Name" variant="standard" value="dummy-temaplte" disabled
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  size="small"
                />
                <TextField id="standard-basic" label="Description" variant="standard" value={"this is description"} disabled multiline
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  size="small"
                />
                <TextField id="standard-basic" label="CreateAt" variant="standard" value={"2023-03-01T10:00:00+0900"} disabled multiline
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  size="small"
                />
                <TextField id="standard-basic" label="UpdateAt" variant="standard" value={"2023-03-01T10:00:00+0900"} disabled multiline
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  size="small"
                />
              </Stack>
              </Grid>
              <Divider orientation='vertical' flexItem />
              <Grid item xs >
              <Stack direction={"column"} spacing={4} >
                <Stack direction={"row"}>
                  <IconButton size='small'>
                    <ContentCopyIcon />
                  </IconButton>
                  <TextField id="standard-basic" label="HttpUrl" variant="standard" value="https://example.com/template1.yaml" disabled type="ur" fullWidth multiline
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                    size="small"
                  />
                </Stack>
                <Stack direction={"row"}>
                  <IconButton size='small'>
                    <ContentCopyIcon />
                  </IconButton>
                  <TextField id="standard-basic" label="S3Url" variant="standard" value="s3://example/template1.yaml" disabled type="ur" fullWidth multiline
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                    size="small"
                  />
                </Stack>
              </Stack>
            </Grid>
            <Divider orientation='vertical' flexItem />
            </Grid>
          </CardContent>
          </Card>
        </Box>
      </Stack>
      <Stack spacing={2} direction={"column"} sx={{}}>
        <Typography variant='h6'>Parameters</Typography>
        <Box sx={{ height: 400, width: '100%', }}>
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
        </Box>
      </Stack>
      <Stack spacing={2} direction={"column"} sx={{}}>
        <Typography variant='h6'>Resources</Typography>
        <Box sx={{ height: 400, width: '100%', }}>
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
        </Box>
      </Stack>
      <Stack spacing={2} direction={"column"} sx={{}}>
        <Typography variant='h6'>Outputs</Typography>
        <Box sx={{ height: 400, width: '100%', }}>
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
        </Box>
      </Stack>
      <EditTemplateDialog
        dialogOpen={editDialogOpen}
        setDialogOpen={setEditDialogOpen}
        selectedTemplate="dummy-template"
      />
      <DeleteTemplateDialog
        dialogOpen={deleteDialogOpen}
        setDialogOpen={setDeleteDialogOpen}
        selectedTemplate="dummy-template"
      />
    </Stack>
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
      setLocalFile(e.target.files[0].name)
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
                  <input hidden accept=".json,.yaml" multiple={false} type="file" onChange={onSelectLocalFile} />
                </Button>
                <Typography>{localFile}</Typography>
              </Stack>
            </Stack>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>CANCEL</Button>
          <Button onClick={handleClose} variant={"contained"}>CREATE</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


interface EditDialogProps {
  selectedTemplate: string
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const EditTemplateDialog: React.FC<EditDialogProps> = ({ dialogOpen, setDialogOpen, selectedTemplate }) => {
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
      setLocalFile(e.target.files[0].name)
    }
  }

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <div>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Edit {selectedTemplate}</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Template Name"
            type={"tex"}
            fullWidth
            variant="outlined"
            value={selectedTemplate}
            disabled={true}
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
                  <input hidden accept=".json,.yaml" multiple={false} type="file" onChange={onSelectLocalFile} />
                </Button>
                <Typography>{localFile}</Typography>
              </Stack>
            </Stack>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>CANCEL</Button>
          <Button onClick={handleClose} variant={"contained"}>EDIT</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


interface DeleteDialogProps {
  selectedTemplate: string
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const DeleteTemplateDialog: React.FC<DeleteDialogProps> = ({ dialogOpen, setDialogOpen, selectedTemplate }) => {
  console.log(`delete template ${selectedTemplate}`)

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <div>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Delete {selectedTemplate}?</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <DialogContentText>
            Are you sure that you want to delete template {selectedTemplate}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>CANCEL</Button>
          <Button onClick={handleClose} variant={"contained"}>DELETE</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
