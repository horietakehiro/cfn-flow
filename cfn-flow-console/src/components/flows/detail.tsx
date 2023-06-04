import { Divider, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import * as React from 'react';

import { DataGrid, GridColDef, GridEventListener, GridRowParams } from '@mui/x-data-grid';
import { Link, useParams } from 'react-router-dom';
import { getFlow, getPlans } from '../../apis/flows/apis';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createPlanDialogOpen, deleteDialogOpen, deletePlanDialogOpen } from '../../stores/flows/common';
import { createPlans, selectFlow, selectPlan, selectPlans, selectSelectedFlow, selectSelectedPlan } from '../../stores/flows/main';
import { CreatePlanDialog, DeleteFlowDialog, DeletePlanDialog } from './common';

const plansCols: GridColDef[] = [
  {
    field: "planName", headerName: "Name", flex: 1, align: "left",
  },
  {
    field: "description", headerName: "Description", flex: 1, align: "left",
  },
  {
    field: "direction", headerName: "Direction", flex: 1, align: "left",
  },
  {
    field: "lastStatus", headerName: "LastStatus", flex: 1, align: "left",
  },

]

export const FlowDetail: React.FC = () => {

  var { flowName } = useParams();

  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  const selectedPlan = useAppSelector(selectSelectedPlan)
  const plans = useAppSelector(selectPlans)



  React.useEffect(() => {
    (async () => {
      if (selectedFlow === null) {
        if (flowName === undefined) return
        try {
          const response: GetFlowResponse = await getFlow(flowName)
          if (response.flow !== null) {
            dispatch(selectFlow(response.flow))
          }
        } catch (e) {
          console.log(e)
        }
      }

      if (flowName === undefined) return
      try {
        const response = await getPlans(flowName)
        if (response.plans !== null) {
          dispatch(createPlans(response.plans))
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])
  const handleRowClick: GridEventListener<'rowClick'> = (params: GridRowParams<Plan>) => {
    dispatch(selectPlan(params.row))
  };

  return (
    <Stack spacing={2}>
      <Stack direction={"row"}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='h6'>{selectedFlow?.name}</Typography>
          </Grid>
          <Grid item xs={8}>
            <Stack spacing={2} direction="row" justifyContent={"flex-end"}>
              {/* <Button variant="outlined" style={{ textTransform: 'none' }}><RefreshIcon /></Button> */}
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                // onClick={() => dispatch(editDialogOpen())}
                disabled={selectedFlow === null}
                component={Link}
                to={"definition"}
              >
                Edit Definition
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(deleteDialogOpen())}
                disabled={selectedFlow === null}
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
                      value={selectedFlow?.name}
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
                      value={selectedFlow?.description}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "black",
                        },
                      }}
                      size="small"
                      disabled multiline={true}
                      rows={2}
                    />
                    <TextField
                      id="createAt" label="CreateAt" variant="standard"
                      value={selectedFlow?.createAt}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "black",
                        },
                      }}
                      size="small"
                      disabled multiline={false}
                    />
                    <TextField
                      id="updateAt" label="UpdateAt"
                      variant="standard" value={selectedFlow?.updateAt}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "black",
                        },
                      }}
                      size="small"
                      disabled multiline={false}
                    />
                  </Stack>
                </Grid>
                <Divider orientation='vertical' flexItem />
                {/* <Grid item xs >
                  <Stack direction={"column"} spacing={4} >
                    <Stack direction={"row"}>
                      <IconButton size='small' onClick={() => { onCopyButtonClick(selectedTemplate?.httpUrl) }}>
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
                        disabled type="ur" fullWidth multiline={true} rows={2} />
                    </Stack>
                    <Stack direction={"row"}>
                      <IconButton size='small' onClick={() => onCopyButtonClick(selectedTemplate?.s3Url)}>
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
                        disabled type="ur" fullWidth multiline={true} rows={2}
                      />
                    </Stack>
                  </Stack>
                </Grid> */}
                <Divider orientation='vertical' flexItem />
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Stack>
      <Stack spacing={2} direction={"column"} sx={{}}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='h6'>Deployment Plans</Typography>
          </Grid>
          <Grid item xs={8} sx={{ justifyContent: "flex-end" }}>
            <Stack direction={"row"} spacing={2} justifyContent={"right"}>
            <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                // onClick={() => dispatch(deletePlanDialogOpen())}
                disabled={selectedPlan === null}
                component={Link}
                to={`deploymentPlans/${selectedPlan?.planName}/definition`}
              >
                Edit Definition
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(deletePlanDialogOpen())}
                disabled={selectedPlan === null}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(createPlanDialogOpen())}
              >
                CREATE
              </Button>

            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ width: '100%', }}>
          <DataGrid
            rows={plans}
            columns={plansCols}
            autoHeight
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[10]}
            getRowId={(row) => row.planName}
            onRowClick={handleRowClick}
          />
        </Box>
      </Stack>
      <DeleteFlowDialog />
      <DeletePlanDialog flowName={selectedFlow !== null ? selectedFlow.name : ""}/>
      <CreatePlanDialog flowName={selectedFlow !== null ? selectedFlow.name : ""}/>
    </Stack>
  );
}


