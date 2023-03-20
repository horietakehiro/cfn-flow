import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import { Typography } from '@mui/material';
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

import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectTemplate, selectSelectedTemplate, updateTemplate } from "../../stores/templates/main"
import {
  createDialogClose, selectCreateDialog,
  editDialogClose, selectEditDialog,
  deleteDialogClose, selectDeleteDialog,
} from '../../stores/templates/common';
import {
  pushTemplate, removeTemplate, selectTemplates,
} from "../../stores/templates/main"

import { Storage, API, Auth } from "aws-amplify"

import AmplifyConfig from '../../AmplifyConfig';

export const getApiAuth = async () => {
  return `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
}

export const CreateTemplateDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectCreateDialog)
  const templates = useAppSelector(selectTemplates)

  enum TemplateSourceType {
    S3 = 1,
    Local = 2
  }
  const [templateSourceType, setTemplateSourceType] = React.useState(TemplateSourceType.S3)
  const [localFile, setLocalFile] = React.useState("")

  const [newTemplate, setNewTemplate] = React.useState<PutTemplateRequest>({
    name: "", description: "", httpUrl: ""
  })


  const onTemplateSourceTypehange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateSourceType(Number(e.target.value))
  }
  const onSelectLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return
    }

    const fileObj = e.target.files[0]
    const localFilename = fileObj.name
    const s3Filename = `${String(Date.now())}/${localFilename}`
    try {
      // upload file
      const accessLevel = "public"
      const result = await Storage.put(s3Filename, fileObj, { level: accessLevel })
      setLocalFile(localFilename)

      // set http url
      const httpUrl = `https://${AmplifyConfig.aws_user_files_s3_bucket}.s3.${AmplifyConfig.aws_user_files_s3_bucket_region}.amazonaws.com/${accessLevel}/${result.key}`
      setNewTemplate({ ...newTemplate, httpUrl: httpUrl })
    } catch (e) {
      console.error(e)
    }
  }

  const onTemplatePropsChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const prevTemplate = newTemplate
    setNewTemplate({ ...prevTemplate, [fieldName]: e.target.value })
  }

  const onSubmit = async (submit: Boolean) => {
    try {
      if (submit) {
        const apiName = 'TemplatesApi';
        const path = `/templates/${newTemplate.name}`
        const myInit = {
          body: newTemplate,
          headers: {
            Authorization: await getApiAuth()
          }
        };
        const response: PutTemplateResponse = await API.put(apiName, path, myInit)
        if (response.template !== null) {
          dispatch(pushTemplate(response.template))
        }

        console.log(response)
      }
    } catch(e) {
      console.error(e)
    }

    setNewTemplate({ name: "", description: "", httpUrl: "" })
    dispatch(createDialogClose())
  }

  // const onSubmmit = (e:React.)

  return (
    <div>
      <Dialog open={open} onClose={() => (dispatch(createDialogClose()))}>
        <DialogTitle>New Template</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            data-testid="template-name"
            autoFocus
            margin="normal"
            id="name"
            label="Template Name"
            type={"tex"}
            fullWidth
            variant="outlined"
            value={newTemplate.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTemplatePropsChange(e, "name")}
          />
          <TextField
            data-testid="description"
            autoFocus
            margin="normal"
            id="description"
            label="Description"
            type={"tex"}
            fullWidth
            variant="outlined"
            multiline
            value={newTemplate.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTemplatePropsChange(e, "description")}
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
                data-testid="amazon-s3-url"
                value={TemplateSourceType.S3}
                control={<Radio />}
                label="Amazon S3 URL"
                checked={templateSourceType === TemplateSourceType.S3}
              />
              <FormControlLabel
                data-testid="upload-local-file"
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
                data-testid="template-url"
                autoFocus
                margin="normal"
                id="url"
                label="Template URL"
                type={"url"}
                fullWidth
                variant="outlined"
                value={newTemplate.httpUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTemplatePropsChange(e, "httpUrl")}
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
          <Button onClick={(e) => onSubmit(false)}>CANCEL</Button>
          <Button data-testid="create-button" onClick={(e) => onSubmit(true)} variant={"contained"}>CREATE</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


export const EditTemplateDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectEditDialog)
  const selectedTemplate = useAppSelector(selectSelectedTemplate)
  const templates = useAppSelector(selectTemplates)

  const [newTemplate, setNewTemplate] = React.useState<PutTemplateRequest>({ name: "", description: "", httpUrl: "", })
  enum TemplateSourceType {
    S3 = 1,
    Local = 2
  }
  const [templateSourceType, setTemplateSourceType] = React.useState(TemplateSourceType.S3)
  const [localFile, setLocalFile] = React.useState("")

  React.useEffect(() => {
    if (selectedTemplate !== null) {
      setNewTemplate({
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        httpUrl: selectedTemplate.httpUrl,
      })
    }
  }, [selectedTemplate])

  const onTemplateSourceTypehange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateSourceType(Number(e.target.value))
  }
  const onSelectLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return
    }

    const fileObj = e.target.files[0]
    const localFilename = fileObj.name
    const s3Filename = `${String(Date.now())}/${localFilename}`
    try {
      // upload file
      const accessLevel = "public"
      const result = await Storage.put(s3Filename, fileObj, { level: accessLevel })
      setLocalFile(localFilename)

      // set http url
      const httpUrl = `https://${AmplifyConfig.aws_user_files_s3_bucket}.s3.${AmplifyConfig.aws_user_files_s3_bucket_region}.amazonaws.com/${accessLevel}/${result.key}`
      setNewTemplate({ ...newTemplate, httpUrl: httpUrl })
    } catch (e) {
      console.error(e)
    }
  }

  const onTemplatePropsChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    setNewTemplate({ ...newTemplate, [fieldName]: e.target.value })
  }


  const onSubmit = async (submit: Boolean) => {
    if (submit) {
      try {
        const apiName = 'TemplatesApi';
        const path = `/templates/${newTemplate.name}`
        const myInit = {
          body: newTemplate,
          headers: {
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
          }
        };
        const response: PutTemplateResponse = await API.put(apiName, path, myInit)
        if (response.template !== null) {
          dispatch(updateTemplate(response.template))
        }

      } catch (e) {
        console.error(e)
      }
    }

    setNewTemplate({ name: "", description: "", httpUrl: "" })
    dispatch(selectTemplate(null))
    dispatch(editDialogClose())
  }

  return (
    <div>
      <Dialog open={open} onClose={() => (dispatch(editDialogClose()))}>
        <DialogTitle>Edit {selectedTemplate?.name}</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Template Name"
            type={"tex"}
            fullWidth
            variant="outlined"
            value={newTemplate.name}
            disabled={true}
          />
          <TextField
            autoFocus
            margin="normal"
            id="description"
            // label="Description"
            type={"tex"}
            fullWidth
            variant="outlined"
            multiline
            value={newTemplate.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onTemplatePropsChange(e, "description") }}
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
                // label="Template URL"
                type={"url"}
                fullWidth
                variant="outlined"
                value={newTemplate.httpUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onTemplatePropsChange(e, "httpUrl") }}
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
          <Button onClick={(e) => onSubmit(false)}>CANCEL</Button>
          <Button onClick={(e) => onSubmit(true)} variant={"contained"}>EDIT</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export const DeleteTemplateDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectDeleteDialog)
  const templates = useAppSelector(selectTemplates)
  const selectedTemplate = useAppSelector(selectSelectedTemplate)

  const onSubmit = async (submit: boolean) => {
    if (submit) {
      try {
        const apiName = 'TemplatesApi';
        const path = `/templates/${selectedTemplate?.name}`
        const myInit = {
          headers: {
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
          }
        };
        const response: DeleteTemplateResponse = await API.del(apiName, path, myInit)
        if (selectedTemplate !== null) {
          dispatch(removeTemplate(selectedTemplate))
        }

      } catch (e) {
        console.error(e)
      }
    }


    dispatch(selectTemplate(null))
    dispatch(deleteDialogClose())
  }

  return (
    <div>
      <Dialog open={open} onClose={() => (dispatch(deleteDialogClose()))}>
        <DialogTitle>Delete {selectedTemplate?.name}?</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <DialogContentText>
            Are you sure that you want to delete template {selectedTemplate?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => { onSubmit(false) }}>CANCEL</Button>
          <Button onClick={(e) => { onSubmit(true) }} variant={"contained"}>DELETE</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
