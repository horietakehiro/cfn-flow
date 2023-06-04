import { Box, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, OutlinedInput, Radio, RadioGroup, Select, SelectChangeEvent, Stack, TextField } from '@mui/material';
import Button from "@mui/material/Button";
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { CSSObject, Theme, styled } from '@mui/material/styles';
import * as React from 'react';
import FlowCanvas from './../flow';
// import ReactFlow, { Background, BackgroundVariant,  ReactFlowInstance } from 'reactflow';
import ClearIcon from '@mui/icons-material/Clear';
import LaunchIcon from '@mui/icons-material/Launch';
// import 'reactflow/dist/style.css';
import EditIcon from "@mui/icons-material/Edit";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import MenuItem from '@mui/material/MenuItem';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid';
import axios, { isAxiosError } from 'axios';
import { shallow } from 'zustand/shallow';
import { getRegions, parseS3HttpUrl, uploadObj } from '../../../apis/common';
import { getTemplates } from '../../../apis/templates/api';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setAlert } from '../../../stores/common';
import { deleteDialogOpen } from '../../../stores/flows/common';
import { closeEditParameterValueDialog, closeNodeEditDrawe as closeNodeEditDrawer, openEditParameterValueDialog, selectEditIODialog, selectEditParameterValueDialog, selectFlow, selectNode, selectNodeEditDrawer, selectOutputRowSelectionModel, selectParameterRowSelectionModel, selectReactFlowInstance, selectSelectedFlow, selectSelectedNode, selector, setOutputRowSelectionModel, setParameterRowSelectionModel } from '../../../stores/flows/main';
import { createTemplates, selectTemplates } from '../../../stores/templates/main';
// import { GetTemplatesResponse, OutputSummary, ParameterSummary, StackNodeIO, StackNodeOutput, StackNodeParameter, StackNodeType, StackSetNodeType, TemplateSummarySection } from '../../types';
import { NavLink, useParams } from 'react-router-dom';
import { getFlow } from '../../../apis/flows/apis';
import { getParameterResources } from '../../../apis/utilities/apis';
import { useStore } from './../../../stores/flows/main';
import { DeleteFlowDialog } from './../common';

const leftDrawerWidth = 240;
const rightDrawerWidth = 600;


const rightDrawerOpenedMixin = (theme: Theme): CSSObject => ({
  width: rightDrawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const rightDrawerClosedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(3)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(4)} + 1px)`,
  },
});


const RightDrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing("11", "11"),
  // necessary for content to be below app bar
  justifyContent: 'flex-end',
  ...theme.mixins.toolbar,
}));

const RightDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: rightDrawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    // position: "relative",
    ...(open && {
      ...rightDrawerOpenedMixin(theme),
      '& .MuiDrawer-paper': rightDrawerOpenedMixin(theme),
    }),
    ...(!open && {
      ...rightDrawerClosedMixin(theme),
      '& .MuiDrawer-paper': rightDrawerClosedMixin(theme),
    }),
  }),
);

enum VisibleEdgeType {
  All = "All",
  Node = "Node",
  IO = "IO",
}

// type ParameterValueFieldProps = {
//   parameter: ParameterSummary

// }
// export const ParameterValueField: React.FC<ParameterValueFieldProps> = ({parameter}) => {
// }

export const EditParameterValueDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const opened = useAppSelector(selectEditParameterValueDialog)
  const selectedNode = useAppSelector(selectSelectedNode)

  const [selectedParameter, setSelectedParameter] = React.useState<StackNodeParameter | null>(null)

  const [availabilityZones, setAvailabilityZones] = React.useState<string[]>([])
  const [instanceDetails, setInstanceDetails] = React.useState<InstanceDetail[]>([])

  React.useEffect(() => {
    (async () => {
      console.log(selectedNode)
      if (selectedNode === null) return
      const selectedParameter = selectedNode.data.parameters.find(p => p.selected)
      if (selectedParameter === undefined) return
      setSelectedParameter({...selectedParameter})
  
      if (selectedNode.data.regionName === null) return
      const regionName = selectedNode.data.regionName
      const parameterType = selectedParameter.type
      try {
        switch (parameterType) {
          case "String": case "Number": case "CommaDelimitedList": case "List<Number>": {
            console.log(selectedParameter.type)
            break
          }
          case "AWS::EC2::AvailabilityZone::Name": case "List<AWS::EC2::AvailabilityZone::Name>": {
            const resp = await getParameterResources<AvailabilityZonesResponse>(
              regionName, parameterType,
            )
            if (resp.availabilityZones === null) break
            setAvailabilityZones([...resp.availabilityZones])
            break
          }
          case "AWS::EC2::Image::Id": case "List<AWS::EC2::Image::Id>": {
            break
          }
          case "AWS::EC2::Instance::Id": case "List<AWS::EC2::Instance::Id>": {
            const resp = await getParameterResources<InstanceDetailsResponse>(
              regionName, parameterType
            )
            if (resp.instanceDetails === null) break
            setInstanceDetails([...resp.instanceDetails])
          }

            break
          case "AWS::EC2::KeyPair::KeyName":
            break
          case "AWS::EC2::SecurityGroup::GroupName":
          case "List<AWS::EC2::SecurityGroup::GroupName>":
            break
          case "AWS::EC2::SecurityGroup::Id":
          case "List<AWS::EC2::SecurityGroup::Id>":
            break
          case "AWS::EC2::Subnet::Id":
          case "List<AWS::EC2::Subnet::Id>":
            break
          case "AWS::EC2::VPC::Id":
          case "List<AWS::EC2::VPC::Id>":
            break
          case "AWS::EC2::Volume::Id":
          case "List<AWS::EC2::Volume::Id>":
            break
          case "AWS::Route53::HostedZone::Id":
          case "List<AWS::Route53::HostedZone::Id>":
            break
          case "AWS::SSM::Parameter::Name":
          case "AWS::SSM::Parameter::Value<AWS::EC2::AvailabilityZone::Name>":
          case "AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>":
          case "AWS::SSM::Parameter::Value<AWS::EC2::Instance::Id>":
          case "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyName>":
          case "AWS::SSM::Parameter::Value<AWS::EC2::SecurityGroup::GroupName>":
          case "AWS::SSM::Parameter::Value<AWS::EC2::SecurityGroup::Id>":
          case "AWS::SSM::Parameter::Value<AWS::EC2::Subnet::Id>":
          case "AWS::SSM::Parameter::Value<AWS::EC2::VPC::Id>":
          case "AWS::SSM::Parameter::Value<AWS::EC2::Volume::Id>":
          case "AWS::SSM::Parameter::Value<AWS::Route53::HostedZone::Id>":
          case "AWS::SSM::Parameter::Value<CommaDelimitedList>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::AvailabilityZone::Name>>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::Image::Id>>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::Instance::Id>>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyName>>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::SecurityGroup::GroupName>>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::SecurityGroup::Id>>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::Subnet::Id>>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::VPC::Id>>":
          case "AWS::SSM::Parameter::Value<List<AWS::EC2::Volume::Id>>":
          case "AWS::SSM::Parameter::Value<List<AWS::Route53::HostedZone::Id>>":
          case "AWS::SSM::Parameter::Value<List<String>>":
          case "AWS::SSM::Parameter::Value<String>":
            break
  
  
          default:
            console.log(`invalid type : ${selectedParameter.type}`)
            break
        }  
      } catch(e) {
        console.error(e)
      }
    })()
  }, [])


  const handleChange = (event: SelectChangeEvent<ParameterType>) => {
    const { target: { value } } = event;
    console.log(value)
  };

  const onClose = (submit: boolean) => {
    if (!submit) {
      dispatch(closeEditParameterValueDialog())
      return
    }
    if (selectedNode === null) return
    if (selectedParameter === null) return

    const newNode: StackNodeType | StackSetNodeType = {
      ...selectedNode, data: {
        ...selectedNode.data,
        parameters: selectedNode.data.parameters.map((p) => {
          return { ...p, selected: false }
        }),
      }
    }
    dispatch(selectNode(newNode))
    // updateNode({ ...newNode })

    dispatch(closeEditParameterValueDialog())
  }

  const getValueField: React.FC = () => {
    if (selectedParameter === null) return
    switch (selectedParameter.type) {
      case "String":
      case "CommaDelimitedList":
      case "List<Number>":
        return (
          <TextField
            autoFocus
            margin="normal"
            id="ActualValue"
            label="Actual Value"
            type={selectedParameter.noEcho ? "password" : "text"}
            fullWidth
            variant="outlined"
            value={selectedParameter.default !== null ? selectedParameter.default : ""}
          />
        )
      case "Number":
        return (
          <TextField
            autoFocus
            margin="normal"
            id="ActualValue"
            label="Actual Value"
            type={"number"}
            fullWidth
            variant="outlined"
            value={selectedParameter.default !== null ? selectedParameter.default : ""}
          />
        )
      default:
        return (
          <></>
        )
    }
  }
  return (
    <div>
      <Dialog open={opened} onClose={() => onClose(false)}>
        <DialogTitle>{"Edit Parameter's Actual Value"}</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          {(selectedNode !== null && selectedParameter !== null) &&
            <>
              <TextField
                autoFocus={false}
                margin="normal"
                id="name"
                label="Name"
                key="Name"
                type={"tex"}
                fullWidth
                variant="outlined"
                value={selectedParameter.name}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "black",
                  },
                }}
              />
              <TextField
                autoFocus={false}
                margin="normal"
                id="description"
                label="Description"
                key={"Description"}
                type={"tex"}
                fullWidth
                variant="outlined"
                value={selectedParameter.description}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "black",
                  },
                }}
              />
              {/* <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="actualValue">Actual Value</InputLabel>
                <Select
                  labelId="io-selection"
                  id="io-selection"
                  multiple
                  key={type === "Parameters" ? "Source" : "Target"}
                  value={ios.map(io => `${io.node.data.nodeName}/${io.io.name}`)}
                  // value={parameterSources}
                  onChange={handleChange}
                  input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                  fullWidth
                  renderValue={(selected) => {
                    console.log(selected)
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: "auto" }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )
                  }}
                  MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: "auto" } } }}
                >
                  {selectableIOs.map((io) => {
                    return (
                      <MenuItem
                        key={`${io.node.data.nodeName}/${io.io.name}`}
                        value={`${io.node.data.nodeName}/${io.io.name}`}
                      // style={getStyles(name, parameters, theme)}
                      >
                        {`${io.node.data.nodeName}/${io.io.name}`}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl> */}
            </>
          }
        </DialogContent>
        <DialogActions>
          <Box sx={{ m: 1, position: 'relative' }}>
            <Button
              data-testid="create-button"
              onClick={() => onClose(true)}
              variant={"contained"}
            >
              SAVE
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  )
}


export const DeploymentDefinition = () => {

  const {flowName} = useParams()

  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  const selectedNode = useAppSelector(selectSelectedNode)
  const opened = useAppSelector(selectEditParameterValueDialog)
  const EditIODialogState = useAppSelector(selectEditIODialog)
  const nodeEditDrawerOpened = useAppSelector(selectNodeEditDrawer)
  const parameterRowSelectionModel = useAppSelector(selectParameterRowSelectionModel)
  const outputRowSelectionModel = useAppSelector(selectOutputRowSelectionModel)

  const [inProgress, setInProgress] = React.useState<boolean>(false)
  const [parametersInProgress, setParametersInProgress] = React.useState<boolean>(false)
  const [outputsInProgress, setOutputsInProgress] = React.useState<boolean>(false)

  const { nodes, edges, upsertNode, initNodes, onNodesChange, onEdgesChange, onConnect, mergeNodes, updateNode, deleteNode, initEdges } = useStore(selector, shallow);


  const templates = useAppSelector(selectTemplates)
  const [searchWord, setSearchWord] = React.useState<string>("")

  const [open, setOpen] = React.useState(true)

  const reactFlowInstance = useAppSelector(selectReactFlowInstance)
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);

  const [visibleEdgeType, setVisibleEdgeType] = React.useState<string>(VisibleEdgeType.All)


  const handleParameterValueEditClick = React.useCallback(
    (params: GridRowParams) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation()
      if (selectedNode === null) {
        console.log("return")
        return
      }
      const paramName = params.id as string
      let newNode = { ...selectedNode }
      newNode.data = {
        ...newNode.data, parameters: newNode.data.parameters.map((p) => {
          return { ...p, selected: p.name === paramName }
        })
      }
      dispatch(selectNode({ ...newNode }))
      dispatch(openEditParameterValueDialog())
    },
    [selectedNode]
  )


  const getParameterValueEditAction = React.useCallback(
    (params: GridRowParams) => {
      if (selectedNode === null) {
        return []
      }
      const paramName = params.id as string
      const param = selectedNode.data.parameters.find(p => p.name === paramName)
      // const isVisible = io !== undefined ? io.visible : false
      if (param === undefined) return
      const isEditable = !param.visible

      return [
        <GridActionsCellItem
          icon={isEditable ? <EditIcon color='primary' /> : <HorizontalRuleIcon />}
          label="edit"
          onClick={handleParameterValueEditClick(params)}
          color='inherit'
          disabled={!isEditable}
        />
      ]
    }, [handleParameterValueEditClick])

  const parametersCols: GridColDef[] = [
    {
      field: "edit", headerName: "Edit", align: "center", flex: 1,
      type: "actions", getActions: (params) => getParameterValueEditAction(params)
    } as GridColDef,
    {
      field: "name", headerName: "Name", flex: 1, align: "left",
    },
    {
      field: "type", headerName: "Type", flex: 1, align: "left",
    },
    {
      field: "description", headerName: "Description", flex: 1, align: "left",
    },
    {
      field: "default", headerName: "Default", flex: 1, align: "left",
    },
    {
      field: "actual", headerName: "Actual", align: "left", flex: 1,
    } as GridColDef,
  ]

  React.useEffect(() => {
    (async () => {
      // set selected flow
      if (flowName === undefined) return
      try {
        const response = await getFlow(flowName)
        if (response.flow !== null) {
          dispatch(selectFlow(response.flow))
        }
      } catch(e) {
        console.log(e)
        dispatch(selectFlow(null))
      }

      // list templates
      console.log("list templates")
      try {
        const response = await getTemplates()
        if (response.templates !== null) {
          dispatch(createTemplates(response.templates))
        }
      } catch (e) {
        let errorMessage = "Failed to get templates"
        if (axios.isAxiosError(e)) {
          const response: GetTemplatesResponse = e.response?.data
          errorMessage += ` : ${response.error}`
        }
      }
    })()

  }, [])

  const onNodeEditDrawerClose = () => {
    dispatch(closeNodeEditDrawer())
    dispatch(selectNode(null))
  }

  const onStackSetNodeDataChange = async (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string[]>, fieldName: StackNodeDataType) => {
    if (selectedNode === null) return
  }

  const onStackNodeDataChange = async (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string[]>, fieldName: StackNodeDataType) => {
    if (selectedNode === null) return
  }

  const onNodeDataChange = async (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string[]>, fieldName: StackNodeDataType) => {
    if (selectedNode === null) return
    switch (selectedNode.type) {
      case "stackNode": {
        onStackNodeDataChange(event, fieldName)
        break
      }
      case "stackSetNode": {
        onStackSetNodeDataChange(event, fieldName)
        break
      }
      default: {
        console.log(`invalid node type : ${selectedNode.type}`)
        break
      }
    }
    return
  }


  const onSave = React.useCallback(() => {

    (async () => {
      try {
        setInProgress(true)

        if (reactFlowInstance && selectedFlow) {

          const flow = JSON.stringify(reactFlowInstance.toObject(), null, 2)
          const { accessLevel, baseObjname, s3PartialKey } = parseS3HttpUrl(selectedFlow.httpUrl)
          const fileObj = new File([flow], baseObjname, { "type": "application/json" })
          const response = await uploadObj(s3PartialKey, fileObj, accessLevel as "public" | "private" | "protected")
          console.log(response)
          dispatch(setAlert({
            persist: 5000, message: `Successfully save flow : ${selectedFlow.name}`,
            opened: true, severity: "success"
          }))
        }
      } catch (e) {
        console.error(e)
        let errorMessage = `Failed to save flow : ${selectedFlow?.name}`
        if (isAxiosError(e)) {
          const response = e.response?.data
          errorMessage += ` : ${response?.error}`
          console.error(e.response)
        }
        dispatch(setAlert({
          persist: null, message: errorMessage,
          opened: true, severity: "error"
        }))
      } finally {
        setInProgress(false)
      }
    })()

  }, [reactFlowInstance])

  React.useEffect(() => {
    if (selectedNode === null) return
    dispatch(setParameterRowSelectionModel(
      selectedNode.data.parameters.filter(p => p.visible).map(p => p.name) as GridRowId[])
    )
    dispatch(setOutputRowSelectionModel(
      selectedNode.data.outputs.filter(o => o.visible).map(o => o.name) as GridRowId[])
    )

  }, [selectedNode])

  const onStackNodeRowSelectionChange = (e: GridRowSelectionModel, sectionName: TemplateSummarySection) => {
    if (selectedNode === null) {
      return
    }
    switch (sectionName) {
      case "Parameters": {
        const newParameters = selectedNode.data.parameters.map((p) => {
          const hasEdge = edges.some(
            e => e.sourceHandle === `${selectedNode.id}/${p.name}` || e.targetHandle === `${selectedNode.id}/${p.name}`)
          return { ...p, visible: e.includes(p.name) || hasEdge }
        })
        dispatch(selectNode({
          ...selectedNode, data: {
            ...selectedNode.data, parameters: [...newParameters]
          }
        }))
        // setParameterRowSelectionModel(e)  
        break
      }
      case "Outputs": {
        const newOutputs = selectedNode.data.outputs.map((o) => {
          const hasEdge = edges.some(
            e => e.sourceHandle === `${selectedNode.id}/${o.name}` || e.targetHandle === `${selectedNode.id}/${o.name}`
          )
          return { ...o, visible: e.includes(o.name) || hasEdge }
        })
        dispatch(selectNode({
          ...selectedNode, data: {
            ...selectedNode.data, outputs: newOutputs
          }
        }))
        break
      }
      default: {
        console.log(`invalid section name : ${sectionName}`)
      }
    }
  }

  const onStackSetNodeRowSelectionChange = (e: GridRowSelectionModel, sectionName: TemplateSummarySection) => {
    if (selectedNode === null) {
      return
    }
    switch (sectionName) {
      case "Parameters": {
        const newParameters = selectedNode.data.parameters.map((p) => {
          const hasEdge = edges.some(
            e => e.sourceHandle === `${selectedNode.id}/${p.name}` || e.targetHandle === `${selectedNode.id}/${p.name}`)
          return { ...p, visible: e.includes(p.name) || hasEdge }
        })
        dispatch(selectNode({
          ...selectedNode, data: {
            ...selectedNode.data, parameters: newParameters
          }
        }))
        nodes.filter(n => n.parentNode === selectedNode.id).forEach((n: StackNodeType) => {
          const newNode: StackNodeType = {
            ...n, data: {
              ...n.data, parameters: newParameters,
            }
          }
          updateNode({ ...newNode })
        })
        break
      }
      case "Outputs": {
        const newOutputs = selectedNode.data.outputs.map((o) => {
          const hasEdge = edges.some(
            e => e.sourceHandle === `${selectedNode.id}/${o.name}` || e.targetHandle === `${selectedNode.id}/${o.name}`
          )
          return { ...o, visible: e.includes(o.name) || hasEdge }
        })
        dispatch(selectNode({
          ...selectedNode, data: {
            ...selectedNode.data, outputs: newOutputs
          }
        }))
        nodes.filter(n => n.parentNode === selectedNode.id).forEach((n: StackNodeType) => {
          const newNode: StackNodeType = {
            ...n, data: {
              ...n.data, outputs: newOutputs,
            }
          }
          updateNode({ ...newNode })
        })
        break
      }
      default: {
        console.log(`invalid section name : ${sectionName}`)
      }
    }
  }
  const onRowSelectionChange = (e: GridRowSelectionModel, sectionName: TemplateSummarySection) => {
    if (selectedNode === null) return
    switch (selectedNode.type) {
      case "stackNode": {
        onStackNodeRowSelectionChange(e, sectionName)
        break
      }
      case "stackSetNode": {
        onStackSetNodeRowSelectionChange(e, sectionName)
        break
      }
      default: {
        console.log(`invalid node type : ${selectedNode.type}`)
      }
    }
  }

  const onVisibleEdgeTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const visibleEdgeType = e.target.value
    setVisibleEdgeType(visibleEdgeType)

    console.log(visibleEdgeType)

    switch (visibleEdgeType) {
      case VisibleEdgeType.All: {
        initEdges(edges.map((e) => {
          return { ...e, hidden: false }
        }))
        break
      }
      case VisibleEdgeType.Node: {
        initEdges(edges.map((e) => {
          if (e.type === "nodeOrderEdge") {
            return { ...e, hidden: false }
          }
          return { ...e, hidden: true }
        }))
        break
      }
      case VisibleEdgeType.IO: {
        initEdges(edges.map((e) => {
          if (e.type === "stackIOEdge") {
            return { ...e, hidden: false }
          }
          return { ...e, hidden: true }
        }))
        break
      }
      default: {
        console.log(`invalid edge type: ${visibleEdgeType}`)
        break
      }
    }
  }

  return (
    <Stack spacing={2} direction={"column"}>
      <Stack direction={"row"}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='h6'>{selectedFlow?.name}</Typography>
          </Grid>
          <Grid item xs={8}>
            <Stack spacing={2} direction="row" justifyContent={"flex-end"}>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                onClick={() => dispatch(deleteDialogOpen())}
              // disabled={selectedTemplate === null}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                style={{ textTransform: 'none' }}
                onClick={onSave}
              // disabled={selectedTemplate === null}
              >
                SAVE
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <Stack direction={"row"}>
        <Grid container spacing={2}>
          <Grid item xs>
            <Stack spacing={2} direction="row" justifyContent={"right"}>
              <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                <Typography align="justify" variant="body1" >Visible Edges: </Typography>
              </Box>
              <FormControl>
                <RadioGroup
                  row
                  aria-labelledby="visible-edges"
                  name="row-radio-buttons-group"
                  onChange={onVisibleEdgeTypeChange}
                >
                  <FormControlLabel
                    value={VisibleEdgeType.All}
                    control={<Radio />}
                    label={VisibleEdgeType.All}
                    checked={visibleEdgeType === VisibleEdgeType.All}
                  />
                  <FormControlLabel
                    value={VisibleEdgeType.Node}
                    control={<Radio />}
                    label={VisibleEdgeType.Node}
                    checked={visibleEdgeType === VisibleEdgeType.Node}
                  />
                  <FormControlLabel
                    value={VisibleEdgeType.IO}
                    control={<Radio />}
                    label={VisibleEdgeType.IO}
                    checked={visibleEdgeType === VisibleEdgeType.IO}
                  />
                </RadioGroup>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <Divider />
      <CssBaseline />
      <Grid container spacing={2}>
        {opened && <EditParameterValueDialog/>}
        <Grid item sx={{ height: "80vh" }} xs={true}>
          <FlowCanvas />
        </Grid>
        {(nodeEditDrawerOpened && selectedNode) &&
          <Grid item xs={false}>
            <RightDrawer
              hideBackdrop={false}
              variant="permanent"
              open
              sx={{
                overflow: "hidden",
                '& .MuiDrawer-root': {
                  position: 'relative'
                },
                '& .MuiDrawer-paper': {
                  position: 'relative',
                },
              }}
            >
              <RightDrawerHeader>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="body1" overflow={"auto"}>Configurations for {selectedNode?.data.nodeName}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() => onNodeEditDrawerClose()}
                      sx={{ px: 0.5 }}
                      data-testid="left-drawer-button"
                    >
                      <ClearIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </RightDrawerHeader>
              <Divider />
              <Stack direction={"column"} spacing={2}>
                <TextField
                  autoFocus={false}
                  margin="normal"
                  id="node-name"
                  label="Node name"
                  type={"tex"}
                  fullWidth
                  variant="outlined"
                  value={selectedNode?.data.nodeName}
                  disabled
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNodeDataChange(e, "nodeName")}
                  required
                  inputProps={{ "data-testid": "template-name" }}
                />
                {selectedNode.type === "stackNode" &&
                  <TextField
                    autoFocus={false}
                    select
                    margin="normal"
                    id="region-name"
                    label="Region name"
                    type={"tex"}
                    fullWidth
                    disabled
                    variant="outlined"
                    value={selectedNode?.data.regionName === null ? "" : selectedNode?.data.regionName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNodeDataChange(e, "regionName")}
                    required
                    inputProps={{ "data-testid": "template-name" }}
                  >
                    {getRegions().map((r, i) => {
                      return (
                        <MenuItem value={r} key={r}>{r}</MenuItem>
                      )
                    })}
                  </TextField>
                }
                {selectedNode.type === "stackSetNode" &&
                  <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel id="regionNames">Region names</InputLabel>
                    <Select
                      labelId="region-selection"
                      id="io-selection"
                      multiple
                      key={"RegionNames"}
                      value={selectedNode.data.regionNames}
                      onChange={(e: SelectChangeEvent<string[]>) => onNodeDataChange(e, "regionNames")}
                      input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                      fullWidth
                      disabled
                      renderValue={(selected) => {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: "auto" }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )
                      }}
                      MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: "auto" } } }}
                    >
                      {getRegions().map((r) => {
                        return (
                          <MenuItem
                            key={r}
                            value={r}
                          // style={getStyles(name, parameters, theme)}
                          >
                            {r}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                }

                <TextField
                  autoFocus={false}
                  select
                  margin="normal"
                  id="template-name"
                  label="Template name"
                  type={"tex"}
                  fullWidth
                  disabled
                  variant="outlined"
                  value={selectedNode?.data.templateName === null ? "" : selectedNode?.data.templateName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNodeDataChange(e, "templateName")}
                  required
                  inputProps={{ "data-testid": "template-name" }}
                >
                  {templates.map((t, i) => {
                    return (
                      <MenuItem value={t.name} key={t.name}>{t.name}</MenuItem>
                    )
                  })}
                </TextField>
                {(selectedNode !== null && selectedNode.data.templateName !== null) &&
                  <NavLink target='_blank' to={`/templates/${selectedNode.data.templateName}`}>
                    <Stack direction={"row"} justifyContent={"right"}>
                      <div>Template's detail</div>
                      <LaunchIcon />
                    </Stack>
                  </NavLink>
                }

                <Stack spacing={0} direction={"column"} sx={{}}>
                  <Typography variant='h6'>Parameters</Typography>
                  <Box sx={{ width: '100%', }}>
                    {parametersInProgress &&
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
                      rows={selectedNode !== null ? selectedNode.data.parameters : []}
                      columns={parametersCols}
                      autoHeight
                      initialState={{
                        pagination: {
                          paginationModel: {
                            pageSize: 10,
                          },
                        },
                      }}
                      pageSizeOptions={[10]}
                      getRowId={(row) => row.name}
                    />
                  </Box>
                </Stack>
              </Stack>
            </RightDrawer>
          </Grid>
        }
      </Grid>
      <DeleteFlowDialog />
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
    </Stack>
  );
}