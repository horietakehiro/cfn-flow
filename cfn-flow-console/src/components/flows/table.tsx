import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import RefreshIcon from '@mui/icons-material/Refresh';
import { Divider, Typography } from '@mui/material';
import { 
  DataGrid, GridColDef, GridEventListener, GridRowParams,
  GridRowSelectionModel
 } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  selectFlow, selectSelectedFlow,
  createFlows, selectFlows,
} from "../../stores/flows/main"
import {
  createDialogOpen,
  editDialogOpen,
  deleteDialogOpen,
} from '../../stores/flows/common';

import { CreateFlowDialog, EditFlowDialog, DeleteFlowDialog, getApiAuth } from './common';

import { API, Auth } from "aws-amplify"


const flowColumns: GridColDef[] = [
  {
    field: "name", headerName: "Name", flex: 1, align: "left",
  },
  {
    field: "description", headerName: "Description", flex: 1, align: "left",
  },
  {
    field: "createAt", headerName: "CreateAt", flex: 1, align: "left",
  },
  {
    field: "updateAt", headerName: "updateAt", flex: 1, align: "left",
  },

]

export const FlowsTable: React.FC = () => {
  const dispatch = useAppDispatch()

  const selectedFlow = useAppSelector(selectSelectedFlow)

  const flows = useAppSelector(selectFlows)

  const getFlows = async () => {
    const apiName = 'FlowsApi';
    const path = '/flows';
    const init = {
      headers: {
        Authorization: await getApiAuth()
      }
    }
    return await API.get(apiName, path, init);
  };

  React.useEffect(() => {
    (async () => {
      dispatch(selectFlow(null))
      try {
        const response:GetFlowsResponse = await getFlows()
        if (response.flows !== null) {
          dispatch(createFlows(response.flows))
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  const handleRowClick: GridEventListener<'rowClick'> = (params: GridRowParams<Flow>) => {
    dispatch(selectFlow(params.row))
  };

  const onRefresh = async () => {
    dispatch(selectFlow(null))
    try {
      const response: GetFlowsResponse = await getFlows()
      if (response.flows !== null) {
        dispatch(createFlows(response.flows))
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
            <Typography variant='h6'>{"CloudFromation Flows"}</Typography>
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
                disabled={selectedFlow === null}
                component={Link}
                to={`${selectedFlow?.name}`}
              >
                View details
              </Button>
              <Button
                data-testid="edit-button"
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(editDialogOpen())}
                disabled={selectedFlow === null}
              >
                Edit
              </Button>
              <Button
                data-testid="delete-button"
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(deleteDialogOpen())}
                disabled={selectedFlow === null}
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
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          data-testid="flows-table"
          rows={flows}
          getRowId={(row) => row.name}
          columns={flowColumns}
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
      <EditFlowDialog />
      <DeleteFlowDialog />
      <CreateFlowDialog />
    </Stack>
  );
}

