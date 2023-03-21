import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import RefreshIcon from '@mui/icons-material/Refresh';
import { Divider, IconButton, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CardContent from "@mui/material/CardContent"
import Card from "@mui/material/Card"

import { EditTemplateDialog, DeleteTemplateDialog, getApiAuth } from './common';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectTemplate, selectSelectedTemplate } from "../../stores/templates/main"
import {
  editDialogOpen,
  deleteDialogOpen,
} from '../../stores/templates/common';
import { API } from 'aws-amplify';


interface TemplateDetailProps {
  templateName: string;
}
export const TemplateDetail: React.FC<TemplateDetailProps> = ({ templateName }) => {

  const selectedTemplate = useAppSelector(selectSelectedTemplate)
  const [parameters, setParameters] = React.useState<ParametersSummary>({})
  const dispatch = useAppDispatch()

  const onCopyButtonClick = (value: string | undefined) => {
    if (value !== undefined) {
      navigator.clipboard.writeText(value)
    }
  }

  const getTemplate = async (name: string) => {
    const apiName = 'TemplatesApi';
    const path = `/templates/${name}`;
    const init = {
      headers: {
        Authorization: await getApiAuth()
      }
    }
    return await API.get(apiName, path, init);
  }

  const getTemplateSummary = async (name: string, section:string) => {
    const apiName = 'TemplatesApi';
    const path = `/templates/${name}/${section}`;
    const init = {
      headers: {
        Authorization: await getApiAuth()
      }
    }
    return await API.get(apiName, path, init);
  }

  React.useEffect(() => {
    (async () => {
      if (selectedTemplate === null) {
        try {
          const response: GetTemplateResponse = await getTemplate(templateName)
          if (response.template !== null) {
            dispatch(selectTemplate(response.template))
          }
        } catch (e) {
          console.log(e)
        }
      }
      try {
        console.log("hoge")
        const parametersResponse:GetTemplateSummaryResponse = await getTemplateSummary(
          templateName, "Parameters"
        )
        if (parametersResponse.templateSummary !== null) {
          setParameters(parametersResponse.templateSummary.summary as ParametersSummary)
          console.log(parametersResponse.templateSummary.summary)
        }  
      } catch (e) {
        console.error(e)
      }

    })()
  }, [])


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
                      disabled multiline={true}
                      rows={2}
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
                      disabled multiline={false}
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
                      disabled multiline={false}
                    />
                  </Stack>
                </Grid>
                <Divider orientation='vertical' flexItem />
                <Grid item xs >
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
      />
      <DeleteTemplateDialog
      />
    </Stack>
  );
}
