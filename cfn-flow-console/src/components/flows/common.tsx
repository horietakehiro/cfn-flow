import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Box, CircularProgress, Typography } from '@mui/material';
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import * as React from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  createDialogClose, createPlanDialogClose, deleteDialogClose, deletePlanDialogClose, editDialogClose, selectCreateDialog, selectCreatePlanDialog, selectDeleteDialog, selectEditDialog, selectPlanDeleteDialog
} from '../../stores/flows/common';
import {
  pushFlow, pushPlan, removeFlow, removePlan, selectFlow, selectPlan, selectSelectedFlow, selectSelectedPlan, updateFlow
} from "../../stores/flows/main";
import {
  AlertSnackbar
} from "../common";
import {
  setAlert
} from "./../../stores/common";

import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ReactFlowJsonObject } from 'reactflow';
import { getApiAuth, uploadObj } from '../../apis/common';
import { deleteFlow, deletePlan, putFlow, putPlan } from '../../apis/flows/apis';

// export const getApiAuth = async () => {
//   return `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
// }

type ValidationErrors = {
  [key in "name" | "httpUrl"]: string | null
}
type ValidationResult = {
  isValid: boolean
  errors: ValidationErrors
}
export const validatePutFlowRequest = (template: PutFlowRequest): ValidationResult => {
  const errors: ValidationErrors = { name: null, httpUrl: null }
  let isValid = true
  if (template.name === "") {
    errors["name"] = "name is required"
    isValid = false
  }

  return { isValid, errors }

}

enum FlowSourceType {
  New = 0,
  S3 = 1,
  Local = 2,
}

// export const CalcNodeDependencies = (nodes:Node[], edges:Edge[]):Node[] => {
//   let newNodes = [...nodes]

//   getOutgoers()



//   return newNodes
// }

export const CreateFlowDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectCreateDialog)

  const [flowSourceType, setFlowSourceType] = React.useState(FlowSourceType.New)
  const [localFile, setLocalFile] = React.useState("")
  const [inProgress, setInProgress] = React.useState<boolean>(false)
  const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({
    name: null, httpUrl: null
  })

  const [newFlow, setNewFlow] = React.useState<PutFlowRequest>({
    name: "", httpUrl: "", description: "",
  })

  const onFlowSourceTypehange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlowSourceType(Number(e.target.value))
  }
  const onSelectLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return
    }

    const fileObj = e.target.files[0]
    const localFilename = fileObj.name
    const s3Filename = `flows/${String(Date.now())}/${localFilename}`
    try {
      setLocalFile(localFilename)
      const { httpUrl } = await uploadObj(s3Filename, fileObj, "public")
      setNewFlow({ ...newFlow, httpUrl: httpUrl })
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setLocalFile(`Failed to upload file : ${e.message}`)
      }
      console.error(e)
    }
  }

  const onFlowPropsChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const prevFlow = newFlow
    setNewFlow({ ...prevFlow, [fieldName]: e.target.value })
  }

  const onSubmit = async (submit: Boolean) => {
    try {
      if (submit) {
        const { isValid, errors } = validatePutFlowRequest(newFlow)
        if (!isValid) {
          setValidationErrors({ ...errors })
          return
        }

        setInProgress(true)

        let requestFlow = { ...newFlow }

        if (flowSourceType === FlowSourceType.New && requestFlow.name !== null) {
          const emptyFlowBody: ReactFlowJsonObject = {
            nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: -1 }
          }
          const fileObj = new File([JSON.stringify(emptyFlowBody)], `${requestFlow.name}.json`)
          const localFilename = fileObj.name
          const s3Filename = `flows/${String(Date.now())}/${localFilename}`
          try {
            setLocalFile(localFilename)
            const { httpUrl } = await uploadObj(s3Filename, fileObj, "public")
            requestFlow.httpUrl = httpUrl
          } catch (e) {
            if (axios.isAxiosError(e)) {
              setLocalFile(`Failed to create new file : ${e.message}`)
            }
            console.error(e)
          }
        }

        const response = await putFlow(requestFlow)
        if (response.flow !== null) {
          dispatch(pushFlow(response.flow))
          dispatch(setAlert({
            persist: 5000, message: `Successfully create flow : ${response.flow.name}`,
            opened: true, severity: "success"
          }))
        }
      }
    } catch (e) {
      let errorMessage = `Failed to create flow : ${newFlow.name}`

      if (axios.isAxiosError(e)) {
        const response: PutFlowResponse = e.response?.data
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
    setNewFlow({ name: "", description: "", httpUrl: "" })
    dispatch(createDialogClose())
  }

  return (
    <div>
      <AlertSnackbar />
      <Dialog open={open} onClose={() => onSubmit(false)}>
        <DialogTitle>New Flow</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Flow Name"
            type={"tex"}
            fullWidth
            variant="outlined"
            value={newFlow.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFlowPropsChange(e, "name")}
            error={validationErrors.name !== null}
            helperText={validationErrors.name}
            required
            inputProps={{ "data-testid": "flow-name" }}
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
            value={newFlow.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFlowPropsChange(e, "description")}
            inputProps={{ "data-testid": "description" }}
          />

          <FormControl>
            <FormLabel id="flow-source">Flow source</FormLabel>
            <RadioGroup
              row
              aria-labelledby="flow-source"
              name="row-radio-buttons-group"
              onChange={onFlowSourceTypehange}
            >
              <FormControlLabel
                data-testid="create-new"
                value={FlowSourceType.New}
                control={<Radio />}
                label="Create New File"
                checked={flowSourceType === FlowSourceType.New}
              />
              {/* <FormControlLabel
                data-testid="amazon-s3-url"
                value={FlowSourceType.S3}
                control={<Radio />}
                label="Amazon S3 URL"
                checked={flowSourceType === FlowSourceType.S3}
              /> */}
              <FormControlLabel
                data-testid="upload-local-file"
                value={FlowSourceType.Local}
                control={<Radio />}
                label="Upload local file"
                checked={flowSourceType === FlowSourceType.Local}
              />
            </RadioGroup>
          </FormControl>
          {flowSourceType === FlowSourceType.S3 &&
            <Stack direction={"row"} spacing={2}>
              <TextField
                inputProps={{ "data-testid": "flow-url" }}
                autoFocus
                margin="normal"
                id="url"
                label="Flow URL"
                type={"url"}
                fullWidth
                variant="outlined"
                value={newFlow.httpUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFlowPropsChange(e, "httpUrl")}
                error={validationErrors.name !== null}
                helperText={validationErrors.name}
                required
              />
            </Stack>
          }
          {flowSourceType === FlowSourceType.Local &&
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

enum PlanDirectionType {
  Forward = "forward",
  Backward = "backward",
}
type PlanDIalogProps = {
  flowName: string
} 
export const CreatePlanDialog: React.FC<PlanDIalogProps> = ({flowName}) => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectCreatePlanDialog)

  const [planDirectionType, setPlanDirectionType] = React.useState<string>(PlanDirectionType.Forward)
  const [inProgress, setInProgress] = React.useState<boolean>(false)

  const [newPlan, setNewPlan] = React.useState<PutPlanRequest>({
    planName: "", flowName: flowName, description: "", lastStatus: "unused", direction: "forward",
  })

  const onPlanDirectionTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlanDirectionType(e.target.value)
    setNewPlan({...newPlan, direction: e.target.value as PlanDirection})
  }

  const onPlanPropsChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    setNewPlan({ ...newPlan, [fieldName]: e.target.value })
  }

  const onSubmit = async (submit: Boolean) => {
    try {
      if (submit) {
        setInProgress(true)

        let requestPlan = { ...newPlan }

        const response = await putPlan(requestPlan)
        if (response.plan !== null) {
          dispatch(pushPlan(response.plan))
          dispatch(setAlert({
            persist: 5000, message: `Successfully create plan : ${response.plan.planName}`,
            opened: true, severity: "success"
          }))
        }
      }
    } catch (e) {
      let errorMessage = `Failed to create plan : ${newPlan.planName}`

      if (axios.isAxiosError(e)) {
        const response: PutPlanResponse = e.response?.data
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

    setNewPlan({planName: "", flowName: flowName, direction: PlanDirectionType.Forward, lastStatus: "unused", description: ""})
    dispatch(createPlanDialogClose())
  }

  return (
    <div>
      <AlertSnackbar />
      <Dialog open={open} onClose={() => onSubmit(false)}>
        <DialogTitle>New Plan</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Plan Name"
            type={"tex"}
            fullWidth
            variant="outlined"
            value={newPlan.planName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPlanPropsChange(e, "planName")}
            required
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
            value={newPlan.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPlanPropsChange(e, "description")}
          />
          <FormControl>
            <FormLabel id="flow-source">Plan Direction</FormLabel>
            <RadioGroup
              row
              aria-labelledby="flow-source"
              name="row-radio-buttons-group"
              onChange={onPlanDirectionTypeChange}
            >
              <FormControlLabel
                value={PlanDirectionType.Forward}
                control={<Radio />}
                label={PlanDirectionType.Forward}
                checked={planDirectionType === PlanDirectionType.Forward}
              />
              <FormControlLabel
                value={PlanDirectionType.Backward}
                control={<Radio />}
                label={PlanDirectionType.Backward}
                checked={planDirectionType === PlanDirectionType.Backward}
              />
            </RadioGroup>
          </FormControl>
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


export const EditFlowDialog: React.FC = () => {
  const { flowName } = useParams()

  const dispatch = useAppDispatch()
  const open = useAppSelector(selectEditDialog)
  const selectedFlow = useAppSelector(selectSelectedFlow)

  const [newFlow, setNewFlow] = React.useState<PutFlowRequest>({ name: "", description: "", httpUrl: "", })
  const [inProgress, setInProgress] = React.useState<boolean>(false)
  const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({
    name: null, httpUrl: null
  })

  enum FlowSourceType {
    S3 = 1,
    Local = 2
  }
  const [flowSourceType, setFlowSourceType] = React.useState(FlowSourceType.S3)
  const [localFile, setLocalFile] = React.useState("")

  React.useEffect(() => {
    if (selectedFlow !== null) {
      setNewFlow({
        name: selectedFlow.name,
        description: selectedFlow.description,
        httpUrl: selectedFlow.httpUrl,
      })
    }
  }, [selectedFlow])

  const onFlowSourceTypehange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlowSourceType(Number(e.target.value))
  }
  const onSelectLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return
    }

    const fileObj = e.target.files[0]
    const localFilename = fileObj.name
    const s3Filename = `flows/${String(Date.now())}/${localFilename}`
    try {
      // upload file
      setLocalFile(localFilename)
      const { httpUrl } = await uploadObj(s3Filename, fileObj, "public")
      setNewFlow({ ...newFlow, httpUrl: httpUrl })
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setLocalFile(`Failed to upload file : ${e.message}`)
      }
      console.error(e)
    }
  }

  const onFlowPropsChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    setNewFlow({ ...newFlow, [fieldName]: e.target.value })
  }


  const onSubmit = async (submit: Boolean) => {
    if (submit) {
      try {
        const { isValid, errors } = validatePutFlowRequest(newFlow)
        if (!isValid) {
          setValidationErrors({ ...errors })
          return
        }
        setInProgress(true)
        const response: PutFlowResponse = await putFlow(newFlow)
        if (response.flow !== null) {
          dispatch(updateFlow(response.flow))
          if (flowName !== undefined) {
            dispatch(selectFlow(response.flow))
          } else {
            dispatch(selectFlow(null))
          }
          dispatch(setAlert({
            persist: 5000, message: `Successfully update flow : ${response.flow.name}`,
            opened: true, severity: "success"
          }))
        }

      } catch (e) {
        let errorMessage = `Failed to update flow : ${newFlow.name}`
        if (axios.isAxiosError(e)) {
          const response: PutFlowResponse = e.response?.data
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
    setNewFlow({ name: "", description: "", httpUrl: "" })
    dispatch(editDialogClose())
  }

  return (
    <div>
      <AlertSnackbar />
      <Dialog open={open} onClose={() => onSubmit(false)}>
        <DialogTitle>Edit {selectedFlow?.name}</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Flow Name"
            type={"tex"}
            fullWidth
            variant="outlined"
            value={newFlow.name}
            disabled={true}
            error={validationErrors.name !== null}
            helperText={validationErrors.name}
            required
            inputProps={{ "data-testid": "flow-name" }}
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
            value={newFlow.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onFlowPropsChange(e, "description") }}
            inputProps={{ "data-testid": "description" }}
          />
          <FormControl>
            <FormLabel id="flow-source">Flow source</FormLabel>
            <RadioGroup
              row
              aria-labelledby="flow-source"
              name="row-radio-buttons-group"
              onChange={onFlowSourceTypehange}
            >
              <FormControlLabel
                value={FlowSourceType.S3}
                control={<Radio />}
                label="Amazon S3 URL"
                checked={flowSourceType === FlowSourceType.S3}
              />
              <FormControlLabel
                value={FlowSourceType.Local}
                control={<Radio />}
                label="Upload local file"
                checked={flowSourceType === FlowSourceType.Local}
              />
            </RadioGroup>
          </FormControl>
          {flowSourceType === FlowSourceType.S3
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
                value={newFlow.httpUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onFlowPropsChange(e, "httpUrl") }}
                error={validationErrors.httpUrl !== null}
                helperText={validationErrors.httpUrl}
                required
                inputProps={{ "data-testid": "flow-url" }}
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

export const DeletePlanDialog: React.FC<PlanDIalogProps> = ({flowName}) => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectPlanDeleteDialog)
  const selectedPlan = useAppSelector(selectSelectedPlan)
  const [inProgress, setInProgress] = React.useState<boolean>(false)

  const onSubmit = async (submit: boolean) => {
    if (submit) {
      try {
        setInProgress(true)
        if (selectedPlan !== null) {
          const response = await deletePlan(selectedPlan.flowName, selectedPlan.planName)
          dispatch(removePlan(selectedPlan))
          dispatch(setAlert({
            persist: 5000, message: `Successfully delete plan : ${response.planName}`,
            opened: true, severity: "success"
          }))
        }
        dispatch(selectPlan(null))

      } catch (e) {
        console.error(e)
        let errorMessage = `Failed to delete plan : ${selectedPlan?.planName}`
        if (axios.isAxiosError(e)) {
          const response: DeletePlanResponse = e.response?.data
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
    dispatch(deletePlanDialogClose())
  }

  return (
    <div>
      <AlertSnackbar />
      <Dialog open={open} onClose={() => onSubmit(false)}>
        <DialogTitle>Delete {selectedPlan?.planName}?</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <DialogContentText>
            Are you sure that you want to delete plan {selectedPlan?.planName}?
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


export const DeleteFlowDialog: React.FC = () => {
  const { flowName } = useParams()

  const dispatch = useAppDispatch()
  const open = useAppSelector(selectDeleteDialog)
  const selectedFlow = useAppSelector(selectSelectedFlow)
  const [inProgress, setInProgress] = React.useState<boolean>(false)

  const onSubmit = async (submit: boolean) => {
    if (submit) {
      try {
        setInProgress(true)
        if (selectedFlow !== null) {
          const response = await deleteFlow(selectedFlow.name)
          dispatch(removeFlow(selectedFlow))
          dispatch(setAlert({
            persist: 5000, message: `Successfully delete flow : ${response.flowName}`,
            opened: true, severity: "success"
          }))
        }
        dispatch(selectFlow(null))

      } catch (e) {
        console.error(e)
        let errorMessage = `Failed to delete flow : ${flowName}`
        if (axios.isAxiosError(e)) {
          const response: DeleteFlowResponse = e.response?.data
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
      
      if (flowName !== undefined) {
        window.location.replace("/flows")
      }


    }
    dispatch(deleteDialogClose())

  }

  return (
    <div>
      <AlertSnackbar />
      <Dialog open={open} onClose={() => onSubmit(false)}>
        <DialogTitle>Delete {selectedFlow?.name}?</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <DialogContentText>
            Are you sure that you want to delete flow {selectedFlow?.name}?
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


export { getApiAuth };

