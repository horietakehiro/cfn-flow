import RefreshIcon from '@mui/icons-material/Refresh';
import { CircularProgress, Divider, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import {
  DataGrid, GridColDef, GridEventListener, GridRowParams
} from '@mui/x-data-grid';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  createDialogOpen, deleteDialogOpen, editDialogOpen
} from '../../stores/templates/common';
import {
  createTemplates, selectSelectedTemplate, selectTemplate, selectTemplates
} from "../../stores/templates/main";

import { CreateTemplateDialog, DeleteTemplateDialog, EditTemplateDialog } from './common';

import { getTemplates } from '../../apis/templates/api';


const templateColumns: GridColDef[] = [
  {
    field: "name", headerName: "Name", flex: 1, align: "left",
  },
  {
    field: "description", headerName: "Description", flex: 1, align: "left",
  },
  {
    field: "httpUrl", headerName: "HttpUrl", flex: 1, align: "left",
  },
  {
    field: "s3Url", headerName: "S3Url", flex: 1, align: "left",
  },
  {
    field: "createAt", headerName: "CreateAt", flex: 1, align: "left",
  },
  {
    field: "updateAt", headerName: "updateAt", flex: 1, align: "left",
  },

]

export const TemplatesTable: React.FC = () => {
  const dispatch = useAppDispatch()

  const selectedTemplate = useAppSelector(selectSelectedTemplate)

  // const [templates, setTemplates] = React.useState<Template[]>([])
  const templates = useAppSelector(selectTemplates)

  const [inProgress, setInProgress] = React.useState<boolean>(false)

  React.useEffect(() => {
    (async () => {
      dispatch(selectTemplate(null))
      try {
        setInProgress(true)
        const response: GetTemplatesResponse = await getTemplates()
        if (response.templates !== null) {
          dispatch(createTemplates(response.templates))
        }
      } catch (e) {
        console.log(e)
      } finally {
        setInProgress(false)
      }
    })()
  }, [])

  const handleRowClick: GridEventListener<'rowClick'> = (params: GridRowParams<Template>) => {
    dispatch(selectTemplate(params.row))
  };

  const onRefresh = async () => {
    dispatch(selectTemplate(null))
    try {
      const response: GetTemplatesResponse = await getTemplates()
      if (response.templates !== null) {
        dispatch(createTemplates(response.templates))
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction={"row"}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='h6'>{"CloudFromation Templates"}</Typography>
          </Grid>
          <Grid item xs={8}>
            <Stack spacing={2} direction="row" justifyContent={"flex-end"}>
              <Button
                data-testid="refresh-button"
                onClick={() => {onRefresh()}}
                variant="outlined"
                style={{ textTransform: 'none' }}
              >
                <RefreshIcon />
              </Button>
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
                data-testid="edit-button"
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(editDialogOpen())}
                disabled={selectedTemplate === null}
              >
                Edit
              </Button>
              <Button
                data-testid="delete-button"
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(deleteDialogOpen())}
                disabled={selectedTemplate === null}
              >
                Delete
              </Button>
              <Button
                data-testid="create-button"
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
      <Box sx={{ width: '100%' }}>
      {inProgress &&
        <CircularProgress
          size={24}
          sx={{
            // color: green[500],
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      }
        <DataGrid
          data-testid="templates-table"
          rows={templates}
          getRowId={(row) => row.name}
          columns={templateColumns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          autoHeight
          pageSizeOptions={[10]}
          onRowClick={handleRowClick}
        // checkboxSelection
        />
      </Box>

      <EditTemplateDialog />
      <DeleteTemplateDialog />
      <CreateTemplateDialog />
    </Stack>
  );
}

