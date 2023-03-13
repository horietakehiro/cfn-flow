import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import RefreshIcon from '@mui/icons-material/Refresh';
import {  Divider,  IconButton, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CardContent from "@mui/material/CardContent"
import Card from "@mui/material/Card"

import { EditTemplateDialog, DeleteTemplateDialog } from './common';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { select, selectSelectedTemplate } from "../../stores/templates/main"



// interface TemplateDetailProps {
//   selectedTemplate: string;
// }
export const TemplateDetail: React.FC = () => {

  const selectedTemplate = useAppSelector(selectSelectedTemplate)
  const dispatch = useAppDispatch()

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  return (
    <Stack spacing={2}>
      <Stack direction={"row"}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='h6'>{selectedTemplate?.name}</Typography>
          </Grid>
          <Grid item xs={8}>
            <Stack spacing={2} direction="row" justifyContent={"flex-end"}>
              <Button variant="outlined" style={{ textTransform: 'none' }}><RefreshIcon /></Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => setEditDialogOpen(true)}
                disabled={selectedTemplate === null}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={selectedTemplate === null}
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
                <TextField
                  id="name" label="Name" variant="standard"
                  value={selectedTemplate?.name}
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  size="small"
                  disabled
                />
                <TextField
                  id="description" label="Description" variant="standard"
                  value={selectedTemplate?.description}
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  size="small"
                  disabled multiline
                />
                <TextField
                  id="createAt" label="CreateAt" variant="standard"
                  value={selectedTemplate?.createAt}
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  size="small"
                  disabled multiline
                />
                <TextField
                  id="updateAt" label="UpdateAt"
                  variant="standard" value={selectedTemplate?.updateAt}
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  size="small"
                  disabled multiline
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
                  <TextField
                    id="httpUrl" label="HttpUrl" variant="standard" 
                    value={selectedTemplate?.httpUrl} 
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                    size="small"
                    disabled type="ur" fullWidth multiline                  />
                </Stack>
                <Stack direction={"row"}>
                  <IconButton size='small'>
                    <ContentCopyIcon />
                  </IconButton>
                  <TextField
                    id="standard-basic" label="S3Url" 
                    variant="standard" value={selectedTemplate?.s3Url}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                    size="small"
                    disabled type="ur" fullWidth multiline
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
        {/* <DataGrid
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
        /> */}
        </Box>
      </Stack>
      <Stack spacing={2} direction={"column"} sx={{}}>
        <Typography variant='h6'>Resources</Typography>
        <Box sx={{ height: 400, width: '100%', }}>
        {/* <DataGrid
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
        /> */}
        </Box>
      </Stack>
      <Stack spacing={2} direction={"column"} sx={{}}>
        <Typography variant='h6'>Outputs</Typography>
        <Box sx={{ height: 400, width: '100%', }}>
        {/* <DataGrid
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
        /> */}
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
