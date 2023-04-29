import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemIcon, OutlinedInput, Select, SelectChangeEvent, Stack, TextField } from '@mui/material';
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
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';

import ClearIcon from '@mui/icons-material/Clear';
import { ReactComponent as StackSVG } from "../../images/Res_AWS-CloudFormation_Stack_48_Dark.svg";
// import 'reactflow/dist/style.css';
import EditIcon from "@mui/icons-material/Edit";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import MenuItem from '@mui/material/MenuItem';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid';
import axios from 'axios';
import { shallow } from 'zustand/shallow';
import { getRegions, parseS3HttpUrl, uploadObj } from '../../apis/common';
import { getTemplateSummary, getTemplates } from '../../apis/templates/api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { editDialogClose } from '../../stores/flows/common';
import { closeEditIODialog, closeNodeEditDrawe as closeNodeEditDrawer, openEditIODialog, selectEditIODialog, selectNode, selectNodeEditDrawer, selectOutputRowSelectionModel, selectParameterRowSelectionModel, selectReactFlowInstance, selectSelectedFlow, selectSelectedNode, selector, setOutputRowSelectionModel, setParameterRowSelectionModel } from '../../stores/flows/main';
import { createTemplates, selectTemplates } from '../../stores/templates/main';
import { useStore } from './../../stores/flows/main';

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
    mergeNodes, updateNode, deleteNode, initNodes,
    upsertEdge, removeEdges,
  } = useStore(selector, shallow);
  const selectedNode = useAppSelector(selectSelectedNode)

  const [selectedIO, setSelectedIO] = React.useState<StackNodeParameter | StackNodeOutput | null>(null)
  const [selectableIOs, setSelectableIOs] = React.useState<StackNodeIODependency[]>([])
  const [ioDependencies, setIODependencies] = React.useState<StackNodeIODependency[]>([])
  const [prevIODependencies, setPrevIODependencies] = React.useState<StackNodeIODependency[]>([])


  React.useEffect(() => {
    if (selectedNode === null) return

    const selectedIOs = type === "Parameters" ? selectedNode.data.parameters.filter(p => p.selected) : selectedNode.data.outputs.filter(o => o.selected)
    if (selectedIOs.length == 0) return
    const selectedIO = selectedIOs[0]
    setSelectedIO(selectedIO)

    // get exsiting io dependencies
    const ioDependencies = nodes.filter((n) => n.type === "stackNode").map((n: StackNode) => {
      return type === "Parameters" ?
        n.data.outputs.map((o) => {
          const isDepended = o.dependencies.filter(d => d.node.id === selectedNode.id && d.dependsOn.name === selectedIO.name)
          if (isDepended.length === 0) return []
          return [{ node: n, dependsOn: o }]
        }).flat() :
        // n.data.parameters.map(p => p.dependencies.filter(d => d.node.id === selectedNode.id)).flat()
        n.data.parameters.map((p) => {
          const isDepended = p.dependencies.filter(d => d.node.id === selectedNode.id && d.dependsOn.name === selectedIO.name)
          if (isDepended.length === 0) return []
          return [{ node: n, dependsOn: p }]
        }).flat()
    }).flat()
    console.log(ioDependencies)
    setIODependencies([...ioDependencies])
    setPrevIODependencies([...ioDependencies])
  }, [])


  React.useEffect(() => {
    const selectableIOs: StackNodeIODependency[] = nodes.filter((n) => n.type === "stackNode").map((n: StackNode) => {
      const otherNodesIOs = type === "Parameters" ?
        n.data.outputs.filter(o => o.visible && n.data.nodeName !== selectedNode?.data.nodeName) :
        n.data.parameters.filter(p => p.visible && n.data.nodeName !== selectedNode?.data.nodeName)
      return otherNodesIOs.map((io) => {
        return { node: n, dependsOn: io }
      })
    }).flat()
    console.log(selectableIOs)
    setSelectableIOs(selectableIOs)
  }, [selectedNode])


  const getStackNodeIODependency = (value: string): StackNodeIODependency | null => {
    const nodeName = value.split("/")[0]
    const ioName = value.split("/")[1]
    const node: StackNode[] = nodes.filter((n) => n.type === "stackNode").filter((n: StackNode) => n.data.nodeName === nodeName)
    if (node.length === 1) {
      const io = type === "Parameters" ?
        node[0].data.outputs.filter(o => o.name === ioName) :
        node[0].data.parameters.filter(p => p.name === ioName)

      if (io.length === 1) {
        return { dependsOn: io[0], node: node[0] }
      }
    }
    return null
  }


  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    console.log(event.target)
    const { target: { value } } = event;
    if (typeof value === "string") {
      const ioDependency = getStackNodeIODependency(value)
      if (ioDependency === null) return
      setIODependencies([ioDependency])
    }
    if (Array.isArray(value)) {
      const newIOs = value.map(
        v => getStackNodeIODependency(v)
      ).filter((v): v is StackNodeIODependency => v !== null)
      setIODependencies([...newIOs])
    }
  };

  const onClose = (submit: boolean) => {
    if (submit === false) {
      setSelectableIOs([])
      setIODependencies([])
      setPrevIODependencies([])

      dispatch(closeEditIODialog())
      return
    }
    if (selectedNode === null) return

    if (type === "Parameters") {
      dispatch(selectNode({
        ...selectedNode, data: {
          ...selectedNode.data, parameters: selectedNode.data.parameters.map((p) => {
            if (p.selected) return { ...p, selected: false, dependencies: ioDependencies }
            return { ...p, selected: false }
          })
        }
      }))
    }
    if (type === "Outputs") {
      dispatch(selectNode({
        ...selectedNode, data: {
          ...selectedNode.data, outputs: selectedNode.data.outputs.map((o) => {
            if (o.selected) return { ...o, selected: false, dependencies: ioDependencies }
            return { ...o, selected: false }
          })
        }
      }))
    }
    updateNode({ ...selectedNode })

    // update other nodes' dependencies
    initNodes(nodes.map((n) => {
      if (n.type !== "stackNode" || n.id === selectedNode.id) return n

      let otherNode: StackNode = { ...n }

      ioDependencies.filter(
        ioDenedency => ioDenedency.node.id === otherNode.id
      ).map(
        (ioDependency) => {
          const otherNodeIOs = type === "Parameters" ? [...otherNode.data.outputs] : [...otherNode.data.parameters]
          const newIOs = otherNodeIOs.map((otherNodeIO) => {
            if (otherNodeIO.name !== ioDependency.dependsOn.name) return otherNodeIO
            const updatedDeps = otherNodeIO.dependencies.map((d) => {
              console.log(d)
              if (d.node.id === selectedNode.id && d.dependsOn.name === selectedIO?.name) {
                // if dependency with for same node and same io has been existed, return updated latest dependency
                return { node: { ...selectedNode }, dependsOn: { ...selectedIO } }
              }
              return d
            })

            console.log(updatedDeps)

            // if dependency for same node and same io does not exist, append it
            const isExisted = updatedDeps.findIndex(
              d => d.node.id === selectedNode.id && d.dependsOn.name === selectedIO?.name
            )
            console.log(isExisted)
            if (isExisted === -1) {
              return {
                ...otherNodeIO, dependencies: [...updatedDeps, {
                  node: { ...selectedNode }, dependsOn: { ...selectedIO }
                }],
              }
            } else {
              return { ...otherNodeIO, dependencies: [...updatedDeps] }
            }
          })
          console.log(newIOs)

          if (type === "Parameters") {
            otherNode = {
              ...otherNode, data: {
                ...otherNode.data, outputs: [...(newIOs as StackNodeOutput[])]
              }
            }
          }
          if (type === "Outputs") {
            otherNode = {
              ...otherNode, data: {
                ...otherNode.data, parameters: [...(newIOs as StackNodeParameter[])]
              }
            }
          }
        }
      )

      const removedDependencies = prevIODependencies.filter(prev => !ioDependencies.some(cur => cur.node.id === prev.node.id && cur.dependsOn.name === prev.dependsOn.name))
      console.log(removedDependencies)
      removedDependencies.map((removedDependency) => {
        // remove removed dependency from other node
        if (removedDependency.node.id !== otherNode.id) return otherNode
        const otherNodeIOs:(StackNodeParameter|StackNodeOutput)[] = type === "Parameters" ? [...otherNode.data.outputs] : [...otherNode.data.parameters]
        const newIOs = otherNodeIOs.map((otherNodeIO) => {
          const newDeps = otherNodeIO.dependencies.filter((d) => {
            otherNodeIO.name
            return d.node.id !== selectedNode.id || (d.node.id === selectedNode.id && d.dependsOn.name === selectedIO?.name)
          })
          console.log(newDeps)
          return {...otherNodeIO, dependencies: [...newDeps]}
        })
        console.log(newIOs)
        if (type === "Parameters") {
          otherNode = {
            ...otherNode, data: {
              ...otherNode.data, outputs: [...(newIOs as StackNodeOutput[])]
            }
          }
        }
        if (type === "Outputs") {
          otherNode = {
            ...otherNode, data: {
              ...otherNode.data, parameters: [...(newIOs as StackNodeParameter[])]
            }
          }
        }
      })

      return otherNode
    }))

    // update edges
    ioDependencies.forEach((ioDependency) => {
      const sourceNodeId = type === "Parameters" ? selectedNode.id : ioDependency.node.id
      const targetNodeId = type === "Parameters" ? ioDependency.node.id : selectedNode.id

      const sourceHandleId = type === "Parameters" ? selectedIO?.name : ioDependency.dependsOn.name
      const targetHandleId = type === "Parameters" ? ioDependency.dependsOn.name : selectedIO?.name

      const sourceId = `${sourceNodeId}/${sourceHandleId}`
      const targetId = `${targetNodeId}/${targetHandleId}`

      const id = `${sourceId}-${targetId}`
      const label = `${sourceHandleId}-${targetHandleId}`

      removeEdges(sourceNodeId, targetNodeId)
      upsertEdge({
        id: id,
        source: sourceNodeId,
        sourceHandle: sourceId,
        target: targetNodeId,
        targetHandle: targetId,
        updatable: true,
        label: label,
        type: "step"
      })
    })
    setSelectableIOs([])
    setIODependencies([])
    setPrevIODependencies([])

    dispatch(closeEditIODialog())
    return

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
                  value={ioDependencies.map(io => `${io.node.data.nodeName}/${io.dependsOn.name}`)}
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
                        key={`${io.node.data.nodeName}/${io.dependsOn.name}`}
                        value={`${io.node.data.nodeName}/${io.dependsOn.name}`}
                      // style={getStyles(name, parameters, theme)}
                      >
                        {`${io.node.data.nodeName}/${io.dependsOn.name}`}
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

export default function FlowDetail() {


  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  const selectedNode = useAppSelector(selectSelectedNode)
  const EditIODialogState = useAppSelector(selectEditIODialog)
  const nodeEditDrawerOpened = useAppSelector(selectNodeEditDrawer)
  const parameterRowSelectionModel = useAppSelector(selectParameterRowSelectionModel)
  const outputRowSelectionModel = useAppSelector(selectOutputRowSelectionModel)

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, mergeNodes, updateNode, deleteNode } = useStore(selector, shallow);


  const templates = useAppSelector(selectTemplates)
  const [searchWord, setSearchWord] = React.useState<string>("")

  const [open, setOpen] = React.useState(true)

  const reactFlowInstance = useAppSelector(selectReactFlowInstance)

  const handleIODependencyClick = React.useCallback(
    (params: GridRowParams, type: "Parameters" | "Outputs") => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation()
      if (selectedNode === null) {
        console.log("return")
        return
      }
      let newNode = { ...selectedNode }
      if (type === "Parameters") {
        newNode.data = {
          ...newNode.data, parameters: newNode.data.parameters.map((p) => {
            return { ...p, selected: p.name === params.id }
          })
        }
      }
      if (type === "Outputs") {
        newNode.data = {
          ...newNode.data, outputs: newNode.data.outputs.map((o) => {
            return { ...o, selected: o.name === params.id }
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
      const io = type === "Parameters" ?
        selectedNode.data.parameters.find((p) => p.name === params.id) :
        selectedNode.data.outputs.find((o) => o.name === params.id)
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

  const onNodeDataChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (selectedNode === null) {
      return
    }

    let newNode = {
      ...selectedNode, data: {
        ...selectedNode.data, [fieldName]: event.target.value,
      }
    }
    if (fieldName === "templateName") {
      try {
        const response = await getTemplateSummary(event.target.value, "Parameters")
        newNode.data.parameters = (response.templateSummary.summary as ParameterSummary[]).map((p) => {
          return { ...p, visible: false, selected: false, dependencies: [] }
        })
        dispatch(setParameterRowSelectionModel([]))
      } catch (e) {
        console.error(e)
      }
      try {
        const response = await getTemplateSummary(event.target.value, "Outputs")
        newNode.data.outputs = (response.templateSummary.summary as OutputSummary[]).map((p) => {
          return { ...p, visible: false, selected: false, dependencies: [] }
        })
        dispatch(setOutputRowSelectionModel([]))
      } catch (e) {
        console.error(e)
      }
    }
    dispatch(selectNode(newNode))
    console.log(event.target.value)

  }
  const onSave = React.useCallback(() => {
    (async () => {
      if (reactFlowInstance && selectedFlow) {
        const flow = JSON.stringify(reactFlowInstance.toObject(), null, 2)
        const { accessLevel, baseObjname, s3PartialKey } = parseS3HttpUrl(selectedFlow.httpUrl)
        const fileObj = new File([flow], baseObjname, { "type": "application/json" })
        const response = await uploadObj(s3PartialKey, fileObj, accessLevel as "public" | "private" | "protected")
        console.log(response)
      }
    })()
  }, [reactFlowInstance])

  React.useEffect(() => {
    if (selectedNode === null) return
    dispatch(setParameterRowSelectionModel(
      selectedNode.data.parameters.filter(p => p.visible).map(p => p.name.toString()) as GridRowId[])
    )
    dispatch(setOutputRowSelectionModel(
      selectedNode.data.outputs.filter(o => o.visible).map(o => o.name.toString()) as GridRowId[])
    )

  }, [selectedNode])

  const onRowSelectionChange = (e: GridRowSelectionModel, sectionName: TemplateSummarySection) => {
    console.log(e)
    if (selectedNode === null) {
      return
    }
    if (sectionName === "Parameters") {
      const newParameters = selectedNode.data.parameters.map((p) => {
        return { ...p, visible: e.includes(p.name as string) || p.dependencies.length > 0 }
      })
      dispatch(selectNode({
        ...selectedNode, data: {
          ...selectedNode.data, parameters: newParameters
        }
      }))
      // setParameterRowSelectionModel(e)
    }
    if (sectionName === "Outputs") {
      const newOutputs = selectedNode.data.outputs.map((o) => {
        return { ...o, visible: e.includes(o.name as string) || o.dependencies.length > 0 }
      })
      dispatch(selectNode({
        ...selectedNode, data: {
          ...selectedNode.data, outputs: newOutputs
        }
      }))

    }
  }

  const onNodeDelete = () => {
    if (selectedNode === null) return
    deleteNode(selectedNode)
    dispatch(editDialogClose())
    dispatch(selectNode(null))
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
              // onClick={() => dispatch(editDialogOpen())}
              // disabled={selectedTemplate === null}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
              // onClick={() => dispatch(deleteDialogOpen())}
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
                  <Button variant={"contained"} onClick={() => onNodeDelete()}>DELETE NODE</Button>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNodeDataChange(e, "nodeName")}
                  required
                  inputProps={{ "data-testid": "template-name" }}
                />
                <TextField
                  autoFocus={false}
                  select
                  margin="normal"
                  id="region-name"
                  label="Region name"
                  type={"tex"}
                  fullWidth
                  variant="outlined"
                  value={selectedNode?.data.regionName === "" ? "-" : selectedNode?.data.regionName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNodeDataChange(e, "regionName")}
                  required
                  inputProps={{ "data-testid": "template-name" }}
                >
                  <MenuItem hidden={true} key={"default"} value={"-"}>-</MenuItem>
                  {getRegions().map((r, i) => {
                    return (
                      <MenuItem value={r} key={r}>{r}</MenuItem>
                    )
                  })}
                </TextField>
                <TextField
                  autoFocus={false}
                  select
                  margin="normal"
                  id="template-name"
                  label="Template name"
                  type={"tex"}
                  fullWidth
                  variant="outlined"
                  value={selectedNode?.data.templateName === "" ? "-" : selectedNode?.data.templateName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNodeDataChange(e, "templateName")}
                  required
                  inputProps={{ "data-testid": "template-name" }}
                >
                  <MenuItem hidden={true} key={"default"} value={"-"}>-</MenuItem>
                  {templates.map((t, i) => {
                    return (
                      <MenuItem value={t.name} key={t.name}>{t.name}</MenuItem>
                    )
                  })}
                </TextField>
                <Stack spacing={0} direction={"column"} sx={{}}>
                  <Typography variant='h6'>Parameters</Typography>
                  <Box sx={{ width: '100%', }}>
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

    </Stack>
  );
}