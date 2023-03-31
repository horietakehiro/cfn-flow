import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import { Box, CircularProgress, Typography } from '@mui/material';
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
  setAlert,
} from "./../../stores/common"
import {
  createDialogClose, selectCreateDialog,
  editDialogClose, selectEditDialog,
  deleteDialogClose, selectDeleteDialog,
} from '../../stores/templates/common';
import {
  pushTemplate, removeTemplate, selectTemplates,
} from "../../stores/templates/main"
import { Storage, API, Auth } from "aws-amplify"
import {
  AlertSnackbar
} from "../common"

import AmplifyConfig from '../../AmplifyConfig';
import { useParams } from 'react-router-dom';
import axios, { Axios } from 'axios';
import { deleteTemplate, putTemplate } from '../../apis/templates/api';
import { uploadObj } from '../../apis/common';

type ValidationErrors = {
  [key in "name" | "httpUrl"]: string | null
}
type ValidationResult = {
  isValid: boolean
  errors: ValidationErrors
}
export const validatePutTemplateRequest = (template: PutTemplateRequest): ValidationResult => {
  const errors: ValidationErrors = { name: null, httpUrl: null }
  let isValid = true
  if (template.name === "") {
    errors["name"] = "name is required"
    isValid = false
  }
  if (template.httpUrl === "") {
    errors["httpUrl"] = "httpUrl is required"
    isValid = false
  }

  return { isValid, errors }

}


export const CreateTemplateDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectCreateDialog)

  enum TemplateSourceType {
    S3 = 1,
    Local = 2
  }
  const [templateSourceType, setTemplateSourceType] = React.useState(TemplateSourceType.S3)
  const [localFile, setLocalFile] = React.useState("")
  const [inProgress, setInProgress] = React.useState<boolean>(false)
  const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({
    name: null, httpUrl: null
  })

  const [newTemplate, setNewTemplate] = React.useState<PutTemplateRequest>({
    name: "", httpUrl: "", description: "",
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
    const s3Filename = `templates/${String(Date.now())}/${localFilename}`
    try {
      setLocalFile(localFilename)
      const {httpUrl} = await uploadObj(s3Filename, fileObj, "public")
      setNewTemplate({ ...newTemplate, httpUrl: httpUrl })
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setLocalFile(`Failed to upload file : ${e.message}`)
      }
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
        const { isValid, errors } = validatePutTemplateRequest(newTemplate)
        if (!isValid) {
          setValidationErrors({ ...errors })
          return
        }

        setInProgress(true)
        const response = await putTemplate(newTemplate)
        if (response.template !== null) {
          console.log(response.template)
          dispatch(pushTemplate(response.template))
          dispatch(setAlert({
              persist: 5000, message: `Successfully create template : ${response.template.name}`,
              opened: true, severity: "success"
          }))
        }
      }
    } catch (e) {
      let errorMessage = `Failed to create template : ${newTemplate.name}`
      if (axios.isAxiosError(e)) {
        const response:PutTemplateResponse = e.response?.data
        errorMessage += ` : ${response.error}`
        console.error(e.response)
      }
      dispatch(setAlert({
        persist: null, message: errorMessage,
        opened: true, severity: "error"
      }))
    } finally {
      setInProgress(false)
    }

    setValidationErrors({ name: null, httpUrl: null })
    setNewTemplate({ name: "", description: "", httpUrl: "" })
    dispatch(createDialogClose())
  }

  return (
    <div>
      <AlertSnackbar/>
      <Dialog open={open} onClose={() => onSubmit(false)}>
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
            value={newTemplate.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTemplatePropsChange(e, "name")}
            error={validationErrors.name !== null}
            helperText={validationErrors.name}
            required
            inputProps={{ "data-testid": "template-name" }}
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
            value={newTemplate.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTemplatePropsChange(e, "description")}
            inputProps={{ "data-testid": "description" }}
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
                inputProps={{ "data-testid": "template-url" }}
                autoFocus
                margin="normal"
                id="url"
                label="Template URL"
                type={"url"}
                fullWidth
                variant="outlined"
                value={newTemplate.httpUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTemplatePropsChange(e, "httpUrl")}
                error={validationErrors.name !== null}
                helperText={validationErrors.name}
                required
              />
            </Stack>
            :
            <Stack direction={"row"} spacing={2}>
              <Stack direction={"row"} spacing={2}>
                <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
                  Upload
                  <input data-testid="upload-button" hidden accept=".json,.yaml" multiple={false} type="file" onChange={onSelectLocalFile} />
                </Button>
                <Typography color={localFile.startsWith("Failed to") ? "red" : "black"}>{localFile}</Typography>
              </Stack>
            </Stack>
          }
        </DialogContent>
        <DialogActions>
          <Button data-testid="cancel-button" onClick={(e) => onSubmit(false)}>CANCEL</Button>
          <Box sx={{ m: 1, position: 'relative' }}>
            <Button
              data-testid="create-button"
              onClick={(e) => onSubmit(true)}
              variant={"contained"}
              disabled={inProgress}
            >
              CREATE
            </Button>
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
          </Box>

        </DialogActions>
      </Dialog>
    </div>
  );
}


export const EditTemplateDialog: React.FC = () => {
  const { templateName } = useParams()

  const dispatch = useAppDispatch()
  const open = useAppSelector(selectEditDialog)
  const selectedTemplate = useAppSelector(selectSelectedTemplate)

  const [newTemplate, setNewTemplate] = React.useState<PutTemplateRequest>({ name: "", description: "", httpUrl: "", })
  const [inProgress, setInProgress] = React.useState<boolean>(false)
  const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({
    name: null, httpUrl: null
  })

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
    const s3Filename = `templates/${String(Date.now())}/${localFilename}`
    try {
      setLocalFile(localFilename)
      const {httpUrl} = await uploadObj(s3Filename, fileObj, "public")
      setNewTemplate({ ...newTemplate, httpUrl: httpUrl })
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setLocalFile(`Failed to upload file : ${e.message}`)
      }
      console.error(e)
    }
  }

  const onTemplatePropsChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    setNewTemplate({ ...newTemplate, [fieldName]: e.target.value })
  }


  const onSubmit = async (submit: Boolean) => {
    if (submit) {
      try {
        const { isValid, errors } = validatePutTemplateRequest(newTemplate)
        if (!isValid) {
          setValidationErrors({ ...errors })
          return
        }

        setInProgress(true)
        const response = await putTemplate(newTemplate)
        if (response.template !== null) {
          dispatch(updateTemplate(response.template))
          if (templateName !== undefined) {
            dispatch(selectTemplate(response.template))
          } else {
            dispatch(selectTemplate(null))
          }
          dispatch(setAlert({
            persist: 5000, message: `Successfully update template : ${response.template.name}`,
            opened: true, severity: "success"
        }))
        }

      } catch (e) {
        let errorMessage = `Failed to update template : ${newTemplate.name}`
        if (axios.isAxiosError(e)) {
          const response:PutTemplateResponse = e.response?.data
          errorMessage += ` : ${response.error}`
          console.error(e.response)
        }
        dispatch(setAlert({
          persist: null, message: errorMessage,
          opened: true, severity: "error"
        }))
      } finally {
        setInProgress(false)
      }
    }

    setValidationErrors({ name: null, httpUrl: null })
    setNewTemplate({ name: "", description: "", httpUrl: "" })
    dispatch(editDialogClose())
  }

  return (
    <div>
      <AlertSnackbar/>
      <Dialog open={open} onClose={() => onSubmit(false)}>
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
            error={validationErrors.name !== null}
            helperText={validationErrors.name}
            required
            inputProps={{ "data-testid": "template-name" }}
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
            inputProps={{ "data-testid": "description" }}
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
                error={validationErrors.httpUrl !== null}
                helperText={validationErrors.httpUrl}
                required
                inputProps={{ "data-testid": "template-url" }}
              />
            </Stack>
            :
            <Stack direction={"row"} spacing={2}>
              <Stack direction={"row"} spacing={2}>
                <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
                  Upload
                  <input hidden accept=".json,.yaml" multiple={false} type="file" onChange={onSelectLocalFile} />
                </Button>
                <Typography color={localFile.startsWith("Failed to") ? "red" : "black"}>{localFile}</Typography>
              </Stack>
            </Stack>
          }
        </DialogContent>
        <DialogActions>
          <Button data-testid="cancel-button" onClick={(e) => onSubmit(false)}>CANCEL</Button>
          <Box sx={{ m: 1, position: 'relative' }}>
            <Button
              data-testid="edit-button"
              onClick={(e) => onSubmit(true)}
              variant={"contained"}
              disabled={inProgress}
            >
              EDIT
            </Button>
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
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export const DeleteTemplateDialog: React.FC = () => {
  const { templateName } = useParams()

  const dispatch = useAppDispatch()
  const open = useAppSelector(selectDeleteDialog)
  const templates = useAppSelector(selectTemplates)
  const selectedTemplate = useAppSelector(selectSelectedTemplate)
  const [inProgress, setInProgress] = React.useState<boolean>(false)

  const onSubmit = async (submit: boolean) => {
    if (submit) {
      try {
        setInProgress(true)
        if (selectedTemplate !== null) {
          const response = await deleteTemplate(selectedTemplate?.name)
          dispatch(removeTemplate(selectedTemplate))
          dispatch(setAlert({
            persist: 5000, message: `Successfully delete template : ${response.templateName}`,
            opened: true, severity: "success"
        }))
        }

      } catch (e) {
        let errorMessage = `Failed to delete template : ${templateName}`
        if (axios.isAxiosError(e)) {
          const response:DeleteTemplateResponse = e.response?.data
          errorMessage += ` : ${response.error}`
          console.error(e.response)
        }
        dispatch(setAlert({
          persist: null, message: errorMessage,
          opened: true, severity: "error"
        }))
      } finally {
        setInProgress(false)

      }
    }
    dispatch(selectTemplate(null))
    dispatch(deleteDialogClose())

    if (templateName !== undefined) {
      window.location.replace("/templates")
    }
  }

  return (
    <div>
      <AlertSnackbar/>
      <Dialog open={open} onClose={() => onSubmit(false)}>
        <DialogTitle>Delete {selectedTemplate?.name}?</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <DialogContentText>
            Are you sure that you want to delete template {selectedTemplate?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button data-testid="cancel-button" onClick={(e) => { onSubmit(false) }}>CANCEL</Button>
          <Box sx={{ m: 1, position: 'relative' }}>
            <Button
              data-testid="delete-button"
              onClick={(e) => { onSubmit(true) }}
              variant={"contained"}
              disabled={inProgress}
            >
              DELETE
            </Button>
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
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  );
}
