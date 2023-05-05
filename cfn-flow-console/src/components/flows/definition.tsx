import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, ListItemIcon, OutlinedInput, Radio, RadioGroup, Select, SelectChangeEvent, Stack, TextField } from '@mui/material';
import Button from "@mui/material/Button";
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { CSSObject, Theme, alpha, styled } from '@mui/material/styles';
import * as React from 'react';
import FlowCanvas from './flow';
// import ReactFlow, { Background, BackgroundVariant,  ReactFlowInstance } from 'reactflow';
import ClearIcon from '@mui/icons-material/Clear';
import LaunchIcon from '@mui/icons-material/Launch';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { ReactComponent as StackSetSVG } from "../../images/Arch_AWS-Organizations_48.svg";
import { ReactComponent as StackSVG } from "../../images/Res_AWS-CloudFormation_Stack_48_Dark.svg";
// import 'reactflow/dist/style.css';
import EditIcon from "@mui/icons-material/Edit";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import MenuItem from '@mui/material/MenuItem';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid';
import axios, { isAxiosError } from 'axios';
import { shallow } from 'zustand/shallow';
import { getRegions, parseS3HttpUrl, uploadObj } from '../../apis/common';
import { getTemplateSummary, getTemplates } from '../../apis/templates/api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setAlert } from '../../stores/common';
import { deleteDialogOpen, editDialogClose } from '../../stores/flows/common';
import { closeEditIODialog, closeNodeEditDrawe as closeNodeEditDrawer, openEditIODialog, selectEditIODialog, selectFlow, selectNode, selectNodeEditDrawer, selectOutputRowSelectionModel, selectParameterRowSelectionModel, selectReactFlowInstance, selectSelectedFlow, selectSelectedNode, selector, setOutputRowSelectionModel, setParameterRowSelectionModel } from '../../stores/flows/main';
import { createTemplates, selectTemplates } from '../../stores/templates/main';
// import { GetTemplatesResponse, OutputSummary, ParameterSummary, StackNodeIO, StackNodeOutput, StackNodeParameter, StackNodeType, StackSetNodeType, TemplateSummarySection } from '../../types';
import { NavLink, useParams } from 'react-router-dom';
import { getConnectedEdges } from 'reactflow';
import { getFlow } from '../../apis/flows/apis';
import { useStore } from './../../stores/flows/main';
import { DeleteFlowDialog } from './common';

const leftDrawerWidth = 240;
const rightDrawerWidth = 600;

const leftDrawerOpenedMixin = (theme: Theme): CSSObject => ({
  width: leftDrawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const leftDrawerClosedMixin = (theme: Theme): CSSObject => ({
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


const LeftDrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing("11", "11"),
  // necessary for content to be below app bar
  justifyContent: 'flex-end',
  ...theme.mixins.toolbar,
}));

const RightDrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing("11", "11"),
  // necessary for content to be below app bar
  justifyContent: 'flex-end',
  ...theme.mixins.toolbar,
}));

const LeftDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: leftDrawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    // position: "relative",
    ...(open && {
      ...leftDrawerOpenedMixin(theme),
      '& .MuiDrawer-paper': leftDrawerOpenedMixin(theme),
    }),
    ...(!open && {
      ...leftDrawerClosedMixin(theme),
      '& .MuiDrawer-paper': leftDrawerClosedMixin(theme),
    }),
  }),
);

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


const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '16ch',
      // '&:focus': {
      //   width: '18ch',
      // },
    },
  },
}));

type EditIODialogProps = {
  type: "Parameters" | "Outputs"
}
export const EditIODialog: React.FC<EditIODialogProps> = ({ type }) => {
  const dispatch = useAppDispatch()
  const { opened } = useAppSelector(selectEditIODialog)
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    mergeNodes, updateNode, deleteNode, initNodes, getNode, initEdges,
    upsertEdge, removeEdges,
  } = useStore(selector, shallow);
  const selectedNode = useAppSelector(selectSelectedNode)

  const [selectedIO, setSelectedIO] = React.useState<StackNodeParameter | StackNodeOutput | null>(null)
  const [selectableIOs, setSelectableIOs] = React.useState<StackNodeIO[]>([])
  const [ios, setIOs] = React.useState<StackNodeIO[]>([])

  const reactFlowInstance = useAppSelector(selectReactFlowInstance)

  React.useEffect(() => {
    console.log(selectedNode)
    if (selectedNode === null) return

    const selectedIOs = type === "Parameters" ? selectedNode.data.parameters.filter(p => p.selected) : selectedNode.data.outputs.filter(o => o.selected)
    if (selectedIOs.length == 0) return
    const selectedIO = selectedIOs[0]
    console.log(selectedIO)
    setSelectedIO(selectedIO)

    // get exsiting io dependencies
    const ios = edges.filter((e) => {
      const handleId = type === "Parameters" ? e.sourceHandle : e.targetHandle
      if (handleId === undefined || handleId === null) return false
      const [nodeId, ioName] = handleId?.split("/")
      return nodeId === selectedNode.id && ioName === selectedIO.name
    }).map((e) => {
      const otherNode = (type === "Parameters" ? getNode(e.target) : getNode(e.source)) as StackNodeType | StackSetNodeType | null
      if (otherNode === null) return null

      const otherHandleId = type === "Parameters" ? e.targetHandle : e.sourceHandle
      const myHandleId = type === "Parameters" ? e.sourceHandle : e.targetHandle
      if (otherHandleId === null || otherHandleId === undefined) return
      if (myHandleId === null || myHandleId === undefined) return
      const [otherNodeId, otherIOName] = otherHandleId.split("/")
      const [myNodeId, myIOName] = myHandleId.split("/")

      const ios = type === "Parameters" ?
        otherNode.data.outputs.filter(o => o.name === otherIOName) :
        otherNode.data.parameters.filter(p => p.name === otherIOName)
      return ios.map(io => { return { node: otherNode, io: io } })

    }).filter(io => io !== null).flat()
    console.log(ios)
    setIOs((ios as StackNodeIO[]))
  }, [])


  React.useEffect(() => {
    const selectableIOs: StackNodeIO[] = nodes.filter(n => n.type !== "startNode").map((n: StackNodeType | StackSetNodeType) => {
      const otherNodesIOs = type === "Parameters" ?
        n.data.outputs.filter(o => o.visible && n.id !== selectedNode?.id) :
        n.data.parameters.filter(p => p.visible && n.id !== selectedNode?.id)
      return otherNodesIOs.map((io) => {
        return { node: n, io: io }
      })
    }).flat()
    console.log(selectableIOs)
    setSelectableIOs(selectableIOs)

    if (reactFlowInstance === null) return
    const flow = JSON.stringify(reactFlowInstance.toObject(), null, 2)
    console.log(flow)
  }, [selectedNode])


  const getStackNodeIO = (value: string): StackNodeIO | null => {
    const [nodeName, ioName] = value.split("/")
    const node: StackNodeType[] = nodes.filter(
      n => n.type !== "startNode").filter((n: StackNodeType) => n.data.nodeName === nodeName
      )
    console.log(node)

    if (node.length === 1) {
      const io = type === "Parameters" ?
        node[0].data.outputs.filter(o => o.name === ioName) :
        node[0].data.parameters.filter(p => p.name === ioName)
      console.log(io)
      if (io.length === 1) {
        return { io: io[0], node: node[0] }
      }
    }
    return null
  }


  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const { target: { value } } = event;
    console.log(value)
    if (typeof value === "string") {
      const io = getStackNodeIO(value)
      if (io === null) return
      setIOs([io])
    }
    if (Array.isArray(value)) {
      const newIOs = value.map(
        v => getStackNodeIO(v)
      ).filter((v): v is StackNodeIO => v !== null)
      setIOs([...newIOs])
      console.log(newIOs)
    }
  };

  const onClose = (submit: boolean) => {
    if (!submit) {
      setSelectableIOs([])
      setIOs([])
      dispatch(closeEditIODialog())
      return
    }
    if (selectedNode === null) return
    if (selectedIO === null) return

    const newNode: StackNodeType | StackSetNodeType = {
      ...selectedNode, data: {
        ...selectedNode.data,
        parameters: selectedNode.data.parameters.map((p) => {
          return { ...p, selected: false }
        }),
        outputs: selectedNode.data.outputs.map((o) => {
          return { ...o, selected: false }
        }),
      }
    }
    dispatch(selectNode(newNode))
    // updateNode({ ...newNode })

    console.log(getConnectedEdges(nodes, edges))
    // remove previous and unused edges
    if (ios.length === 0) {
      if (type === "Parameters" && selectedIO !== null) {
        removeEdges(selectedNode.id, null, `${selectedNode.id}/${selectedIO.name}`, null)
      }
      if (type === "Outputs" && selectedIO !== null) {
        removeEdges(null, selectedNode.id, null, `${selectedNode.id}/${selectedIO.name}`)
      }
    }

    // update edges
    const newEdges = ios.map((io) => {
      const sourceNodeId = type === "Parameters" ? selectedNode.id : io.node.id
      const targetNodeId = type === "Parameters" ? io.node.id : selectedNode.id

      const sourceHandleId = type === "Parameters" ? selectedIO?.name : io.io.name
      const targetHandleId = type === "Parameters" ? io.io.name : selectedIO?.name

      const sourceId = `${sourceNodeId}/${sourceHandleId}`
      const targetId = `${targetNodeId}/${targetHandleId}`

      const id = `${sourceId}-${targetId}`
      const label = `${sourceHandleId}-${targetHandleId}`

      if (type === "Parameters") {
        removeEdges(sourceNodeId, targetNodeId, sourceId, null)
      }
      if (type === "Outputs") {
        removeEdges(sourceNodeId, targetNodeId, null, targetId)
      }
      const data: StackIOEdgeData = {
        targetLabel: targetHandleId,
        sourceLable: sourceHandleId,
      }
      return {
        id: id,
        source: sourceNodeId,
        sourceHandle: sourceId,
        target: targetNodeId,
        targetHandle: targetId,
        updatable: true,
        label: label,
        type: "stackIOEdge",
        data: data,
      }
    })
    newEdges.forEach(e => upsertEdge(e))

    setSelectableIOs([])
    setIOs([])
    dispatch(closeEditIODialog())

  }

  return (
    <div>
      <Dialog open={opened} onClose={() => onClose(false)}>
        <DialogTitle>{type === "Parameters" ? "Edit Parameter's Source" : "Edit Output's Target"}</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          {(selectedNode !== null && selectedIO !== null) &&
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
                value={selectedIO.name}
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
                value={selectedIO.description}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "black",
                  },
                }}
              />
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="ioDependency">{type === "Parameters" ? "Source" : "Target"}</InputLabel>
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
              </FormControl>
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

enum VisibleEdgeType {
  All = "All",
  Node = "Node",
  IO = "IO",
}

export const FlowDefinition = () => {

  const {flowName} = useParams()

  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  const selectedNode = useAppSelector(selectSelectedNode)
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


  const handleIODependencyClick = React.useCallback(
    (params: GridRowParams, type: "Parameters" | "Outputs") => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation()
      if (selectedNode === null) {
        console.log("return")
        return
      }
      const ioName = params.id as string
      let newNode = { ...selectedNode }
      if (type === "Parameters") {
        newNode.data = {
          ...newNode.data, parameters: newNode.data.parameters.map((p) => {
            return { ...p, selected: p.name === ioName }
          })
        }
      }
      if (type === "Outputs") {
        newNode.data = {
          ...newNode.data, outputs: newNode.data.outputs.map((o) => {
            return { ...o, selected: o.name === ioName }
          })
        }
      }
      dispatch(selectNode({ ...newNode }))
      dispatch(openEditIODialog(type))
    },
    [selectedNode]
  )


  const getIODependencyAction = React.useCallback(
    (params: GridRowParams, type: "Parameters" | "Outputs") => {
      if (selectedNode === null) {
        return []
      }
      const ioName = params.id as string
      const io = type === "Parameters" ?
        selectedNode.data.parameters.find((p) => p.name === ioName) :
        selectedNode.data.outputs.find((o) => o.name === ioName)
      const isVisible = io !== undefined ? io.visible : false
      return [
        <GridActionsCellItem
          icon={isVisible ? <EditIcon color='primary' /> : <HorizontalRuleIcon />}
          label={type === "Parameters" ? 'source' : "target"}
          onClick={handleIODependencyClick(params, type)}
          color='inherit'
          disabled={!isVisible}
        />
      ]
    }, [handleIODependencyClick])

  const parametersCols: GridColDef[] = [
    {
      field: "source", headerName: "Source", align: "center", flex: 1,
      type: "actions", getActions: (params) => getIODependencyAction(params, "Parameters")
    } as GridColDef,
    // {
    //   field: "regionName", headerName: "Region", flex: 1, align: "left",
    // },
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
      field: "noEcho", headerName: "NoEcho", flex: 1, align: "left",
    },
  ]
  const outputsCols: GridColDef[] = [
    {
      field: "target", headerName: "Target", align: "center", flex: 1,
      type: "actions", getActions: (params) => getIODependencyAction(params, "Outputs")
    } as GridColDef,
    // {
    //   field: "regionName", headerName: "Region", flex: 1, align: "left",
    // },
    {
      field: "name", headerName: "Name", flex: 1, align: "left",
    },
    {
      field: "value", headerName: "Value", flex: 1, align: "left",
    },
    {
      field: "description", headerName: "Description", flex: 1, align: "left",
    },
    {
      field: "exportName", headerName: "ExportName", flex: 1, align: "left",
    },
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


  const onDragStart = (event: React.DragEvent<HTMLLIElement>, nodeType: string) => {
    if (event.dataTransfer !== null) {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  const onNodeEditDrawerClose = () => {
    dispatch(closeNodeEditDrawer())
    dispatch(selectNode(null))
  }

  const onStackSetNodeDataChange = async (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string[]>, fieldName: StackNodeDataType) => {
    if (selectedNode === null) return
    const value = event.target.value
    let newNode: StackSetNodeType | null = null
    let childNodes: StackNodeType[] = []

    let parameters: StackNodeParameter[] = []
    let outputs: StackNodeOutput[] = []

    switch (fieldName) {
      case "nodeName":
        const prevName = selectedNode.data.nodeName
        // replace child nodes' name suffix
        childNodes = nodes.filter(n => n.parentNode === selectedNode.id).map((n: StackNodeType) => {
          return {
            ...n, data: {
              ...n.data, [fieldName]: n.data.nodeName.replace(prevName, value as string)
            }
          }
        })
        newNode = {
          ...selectedNode, data: {
            ...selectedNode.data, [fieldName]: value as string
          }
        }
        dispatch(selectNode(newNode))
        childNodes.forEach(n => upsertNode(n))
        break

      case "regionNames":
        const regionNames = value as string[]
        newNode = {
          ...selectedNode, data: {
            ...selectedNode.data, [fieldName]: regionNames,
            parameters: parameters, outputs: outputs
          }
        }

        const prevChildNodes = nodes.filter((n: StackNodeType) => n.parentNode === selectedNode.id)
        console.log(prevChildNodes)
        initNodes(nodes.filter(n => !prevChildNodes.some(cn => cn.id === n.id)))
        regionNames.forEach((r, i) => {
          const prevNode = prevChildNodes.filter((n: StackNodeType) => n.data.regionName === r)
          if (prevNode.length === 0) {

            // const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
            const position = reactFlowInstance === null ? { ...selectedNode.position } : reactFlowInstance.project({ ...selectedNode.position })
            // calc position
            console.log(selectedNode.position)
            console.log(position)
            console.log(reactFlowInstance)
            const nodeId = `${selectedNode.id}-${r}`
            const nodeName = `${selectedNode.data.nodeName}-${r}`
            const data: StackNodeData = {
              nodeId: nodeId,
              nodeName: nodeName,
              toolbarVisible: true,
              nodeDeletable: true,
              regionName: r, templateName: selectedNode.data.templateName,
              regionNames: [],
              parameters: [...selectedNode.data.parameters],
              outputs: [...selectedNode.data.outputs],
              isChild: true,
              order: null,
            }
            const newNode: StackNodeType = {
              id: nodeId,
              type: "stackNode",
              position: { x: i * 400, y: 100 },
              data: data,
              selected: false,
              selectable: true,
              parentNode: selectedNode.id,
              extent: "parent",
              expandParent: true,
              style: {
                border: '1px solid #777', padding: 10, background: "white",
                height: "auto", width: "auto",
              },
            }
            upsertNode({ ...newNode })
          } else {
            upsertNode({ ...prevNode[0] })
          }
          dispatch(selectNode(newNode))

        })
        break
      case "templateName":
        try {
          setParametersInProgress(true)
          const response = await getTemplateSummary(value as string, "Parameters")
          parameters = (response.templateSummary.summary as ParameterSummary[]).map((p) => {
            return { ...p, visible: false, selected: false, regionName: null, accountId: null }
          })
          console.log(parameters)
          dispatch(setParameterRowSelectionModel([]))
        } catch (e) {
          console.error(e)
        } finally {
          setParametersInProgress(false)
        }
        try {
          setOutputsInProgress(true)
          const response = await getTemplateSummary(value as string, "Outputs")
          outputs = (response.templateSummary.summary as OutputSummary[]).map((o) => {
            return { ...o, visible: false, selected: false, regionName: null, accountId: null }
          })
          dispatch(setOutputRowSelectionModel([]))
        } catch (e) {
          console.error(e)
        } finally {
          setOutputsInProgress(false)
        }
        newNode = {
          ...selectedNode, data: {
            ...selectedNode.data, [fieldName]: value as string,
            parameters: parameters, outputs: outputs
          }
        }
        dispatch(selectNode(newNode))
        nodes.filter(n => n.parentNode === selectedNode.id).forEach((n: StackNodeType) => {
          upsertNode({
            ...n, data: {
              ...n.data, [fieldName]: value as string,
              parameters: parameters, outputs: outputs,
            }
          })
        })
        break
      default:
        console.log(`invalid fieldName : ${fieldName}`)
    }

  }

  const onStackNodeDataChange = async (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string[]>, fieldName: StackNodeDataType) => {
    if (selectedNode === null) return
    const value = event.target.value
    let newNode: StackNodeType | null = null
    let parameters: StackNodeParameter[] = []
    let outputs: StackNodeOutput[] = []
    switch (fieldName) {
      case "nodeName":
        newNode = {
          ...selectedNode, data: {
            ...selectedNode.data, [fieldName]: value as string
          }
        }
        break
      case "regionName":
        newNode = {
          ...selectedNode, data: {
            ...selectedNode.data, [fieldName]: value as string,
          }
        }
        break
      case "templateName":

        try {
          const response = await getTemplateSummary(value as string, "Parameters")
          parameters = (response.templateSummary.summary as ParameterSummary[]).map((p) => {
            if (selectedNode.data.regionNames.length !== 0) {
              return selectedNode.data.regionNames.map((r) => {
                return { ...p, visible: false, selected: false, regionName: r, accountId: null }
              })
            } else {
              return { ...p, visible: false, selected: false, regionName: null, accountId: null }
            }
          }).flat()
          console.log(parameters)
          dispatch(setParameterRowSelectionModel([]))
        } catch (e) {
          console.error(e)
        }
        try {
          const response = await getTemplateSummary(value as string, "Outputs")
          outputs = (response.templateSummary.summary as OutputSummary[]).map((o) => {
            if (selectedNode.data.regionNames.length !== 0) {
              return selectedNode.data.regionNames.map((r) => {
                return { ...o, visible: false, selected: false, regionName: r, accountId: null }
              })
            } else {
              return { ...o, visible: false, selected: false, regionName: null, accountId: null }
            }
          }).flat()
          dispatch(setOutputRowSelectionModel([]))

        } catch (e) {
          console.error(e)
        }
        newNode = {
          ...selectedNode, data: {
            ...selectedNode.data, [fieldName]: value as string,
            parameters: parameters, outputs: outputs
          }
        }
        break
      default:
        console.log(`invalid fieldName : ${fieldName}`)
    }
    dispatch(selectNode(newNode))
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

  const onNodeDelete = () => {
    if (selectedNode === null) return
    deleteNode(selectedNode)
    dispatch(editDialogClose())
    dispatch(selectNode(null))
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
        <Grid item xs={false}>
          <LeftDrawer
            hideBackdrop={false}
            variant="permanent"
            open={open}
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
            <LeftDrawerHeader>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  onChange={(e) => setSearchWord(e.target.value)}
                  placeholder="Search…"
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>
              <IconButton
                onClick={() => setOpen(!open)}
                sx={{ px: 0.5 }}
                data-testid="left-drawer-button"
              >
                {open ? <ChevronLeftIcon data-testid="left-sub-drawer-close-button" /> : <MenuIcon data-testid="left-sub-drawer-open-button" />}
              </IconButton>
            </LeftDrawerHeader>
            <Divider />
            <List>
              <ListItem
                key={`stack-node`}
                disablePadding
                sx={{ display: 'block', }}
                draggable
                onDragStart={(event) => onDragStart(event, "stackNode")}
              >
                <ListItemButton
                  sx={{
                    cursor: "grab",
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  disableRipple
                  disableTouchRipple
                >
                  <ListItemIcon sx={{ opacity: open ? 1 : 0 }}>
                    <StackSVG />
                  </ListItemIcon>
                  <TextField
                    id="name" label="Type" variant="outlined"
                    value={"Stack Node"}
                    sx={{
                      overflow: "visible",
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                      cursor: "grabbing",
                      opacity: open ? 1 : 0
                    }}
                    size="small"
                    disabled
                  />
                </ListItemButton>
              </ListItem>
              <ListItem
                key={`stackset-node`}
                disablePadding
                sx={{ display: 'block', }}
                draggable
                onDragStart={(event) => onDragStart(event, "stackSetNode")}
              >
                <ListItemButton
                  sx={{
                    cursor: "grab",
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  disableRipple
                  disableTouchRipple
                >
                  <ListItemIcon sx={{ opacity: open ? 1 : 0, }}>
                    <StackSetSVG />
                  </ListItemIcon>
                  <TextField
                    id="name" label="Type" variant="outlined"
                    value={"StackSet Node"}
                    sx={{
                      overflow: "visible",
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                      cursor: "grabbing",
                      opacity: open ? 1 : 0
                    }}
                    size="small"
                    disabled
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </LeftDrawer>
        </Grid>
        {(EditIODialogState.opened && EditIODialogState.type !== null) && <EditIODialog type={EditIODialogState.type} />}
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
                <Stack direction={"row"} justifyContent={"right"}>
                  <Button variant={"outlined"} onClick={() => onNodeDelete()}>DELETE NODE</Button>
                </Stack>
                <TextField
                  autoFocus={false}
                  margin="normal"
                  id="node-name"
                  label="Node name"
                  type={"tex"}
                  fullWidth
                  variant="outlined"
                  value={selectedNode?.data.nodeName}
                  disabled={selectedNode.parentNode !== undefined}
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
                    disabled={selectedNode.parentNode !== undefined}
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
                  disabled={selectedNode.parentNode !== undefined}
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
                      checkboxSelection
                      disableRowSelectionOnClick
                      onRowSelectionModelChange={(e) => onRowSelectionChange(e, "Parameters")}
                      rowSelectionModel={parameterRowSelectionModel}

                    />
                  </Box>
                </Stack>
                <Stack spacing={0} direction={"column"} sx={{}}>
                  <Typography variant='h6'>Outputs</Typography>
                  <Box sx={{ width: '100%', }}>
                    {outputsInProgress &&
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
                      rows={selectedNode !== null ? selectedNode.data.outputs : []}
                      columns={outputsCols}
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
                      checkboxSelection
                      disableRowSelectionOnClick
                      onRowSelectionModelChange={(e) => onRowSelectionChange(e, "Outputs")}
                      rowSelectionModel={outputRowSelectionModel}
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