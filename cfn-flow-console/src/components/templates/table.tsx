import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import RefreshIcon from '@mui/icons-material/Refresh';
import { Divider, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {  Link } from 'react-router-dom';

import { CreateTemplateDialog, EditTemplateDialog, DeleteTemplateDialog } from './common';

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

