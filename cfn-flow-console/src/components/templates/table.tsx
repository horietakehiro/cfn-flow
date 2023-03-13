import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import RefreshIcon from '@mui/icons-material/Refresh';
import { Divider, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridEventListener, GridRowParams } from '@mui/x-data-grid';
import {  Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { select, selectSelectedTemplate } from "../../stores/templates/main"
import {
    createDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
} from '../../stores/templates/common';

import { CreateTemplateDialog, EditTemplateDialog, DeleteTemplateDialog } from './common';


const columns: GridColDef[] = [
  {
    field: "name", headerName: "Name", width: 200, align: "left",
  },
  {
    field: "description", headerName: "Description", width: 200, align: "left",
  },
  {
    field: "httpUrl", headerName: "HttpURL", width: 200, align: "left",
  },
  {
    field: "s3Url", headerName: "S3URL", width: 200, align: "left",
  },
  {
    field: "createAt", headerName: "CreateAt", width: 200, align: "left",
  },
  {
    field: "updateAt", headerName: "UpdateAt", width: 200, align: "left",
  },

]

const rows: Template[] = [
  {
    id: "1",
    name: "Template1",
    description: "this is  template1",
    httpUrl: "https://example.com/template1.yaml",
    s3Url: "s3://example/template1.yaml",
    createAt: "2023-03-01T10:00:00+0900",
    updateAt: "2023-03-01T11:00:00+0900"
  },
  {
    id: "2",
    name: "Template2",
    description: "this is  template2",
    httpUrl: "https://example.com/template2.yaml",
    s3Url: "s3://example/template2.yaml",
    createAt: "2023-03-01T10:00:00+0900",
    updateAt: "2023-03-01T11:00:00+0900"
  }
]


export const TemplatesTable: React.FC = () => {
  const dispatch = useAppDispatch()

  const selectedTemplate = useAppSelector(selectSelectedTemplate)
  // const createDialog = useAppSelector(selectCreateDialog)
  // const editDialog = useAppSelector(selectEditDialog)
  // const deleteDialog = useAppSelector(selectDeleteDialog)

  React.useEffect(() => {
    dispatch(select(null))
  }, [])

  const handleRowClick: GridEventListener<'rowClick'> = (params: GridRowParams<Template>) => {
    dispatch(select(params.row))
  };

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
                disabled={selectedTemplate === null}
                component={Link}
                to={`${selectedTemplate?.name}`}
              >
                View details
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(editDialogOpen())}
                disabled={selectedTemplate === null}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(deleteDialogOpen())}
                disabled={selectedTemplate === null}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(createDialogOpen())}
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
          onRowClick={handleRowClick}
        // checkboxSelection
        />
      </Box>

      <EditTemplateDialog
        // dialogOpen={editDialogOpen}
        // setDialogOpen={setEditDialogOpen}
        // selectedTemplate="dummy-template"
      />
      <DeleteTemplateDialog
        // dialogOpen={deleteDialogOpen}
        // setDialogOpen={setDeleteDialogOpen}
        // selectedTemplate="dummy-template"
      />
      <CreateTemplateDialog
        // dialogOpen={createDialogOpen}
        // setDialogOpen={setCreateDialogOpen}
      />
    </Stack>
  );
}

