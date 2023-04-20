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
import { closeEditOutputTargetDialog, closeEditParameterSourceDialog, closeNodeEditDrawe as closeNodeEditDrawer, openEditOutputTargetDialog, openEditParameterSourceDialog, selectEditOutputTargetDialog, selectEditParameterSourceDialog, selectNode, selectNodeEditDrawer, selectOutputRowSelectionModel, selectParameterRowSelectionModel, selectReactFlowInstance, selectSelectedFlow, selectSelectedNode, selector, setOutputRowSelectionModel, setParameterRowSelectionModel } from '../../stores/flows/main';
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



export const EditParameterSourceDialog: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, mergeNodes, updateNode, deleteNode, initNodes, addEdge } = useStore(selector, shallow);
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectEditParameterSourceDialog)
  const selectedNode = useAppSelector(selectSelectedNode)
  // const [personName, setPersonName] = React.useState<string[]>([]);
  const [selectableOutputs, setSelectableOutputs] = React.useState<StackNodeParameterSource[]>([])
  const [parameterSources, setParameterSources] = React.useState<StackNodeParameterSource[]>([])


  React.useEffect(() => {
    console.log("init output targets")
    if (selectedNode === null) return
    if ((selectedNode.data.parameters.filter(p => p.selected)).length == 0) return
    const parameter = selectedNode.data.parameters.filter(p => p.selected)[0]

    const sourceOutputs = nodes.filter((n) => n.type === "stackNode").map((n: StackNode) => {
      return n.data.outputs.filter(o => o.target.filter(t => t.parameter.name === parameter.name).length > 0).map((o) => {
        return { node: n, output: o as OutputSummary }
      })
    }).flat()
    console.log(sourceOutputs)
    setParameterSources(sourceOutputs)
  }, [])

  React.useEffect(() => {
    console.log("get selectable outputs")
    const outputs = nodes.filter((n) => n.type === "stackNode").map((n: StackNode) => {
      return n.data.outputs.filter((o) => o.visible && n.data.nodeName !== selectedNode?.data.nodeName).map((o) => {
        return { node: n, output: o }
      })
    }).flat()
    console.log(nodes)
    setSelectableOutputs(outputs)
  }, [selectedNode])

  const getStackNodeParameterSource = (value: string): StackNodeParameterSource | null => {
    const nodeName = value.split("/")[0]
    const outputName = value.split("/")[1]
    const node: StackNode[] = nodes.filter((n) => n.type === "stackNode").filter((n: StackNode) => n.data.nodeName === nodeName)
    if (node.length === 1) {
      const output = node[0].data.outputs.filter((o) => o.name === outputName)
      if (output.length === 1) {
        return { output: output[0], node: node[0] }
      }
    }
    return null
  }

  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const { target: { value } } = event;
    console.log(value)
    if (typeof value === "string") {
      const source = getStackNodeParameterSource(value)
      if (source === null) return
      setParameterSources([source])
    }
    if (Array.isArray(value)) {
      setParameterSources(value.map(
        v => getStackNodeParameterSource(v)
      ).filter((v): v is StackNodeParameterSource => v !== null)
      )
    }

  };


  const onClose = (submit: boolean) => {
    setSelectableOutputs([])
    setParameterSources([])

    if (submit === true) {
      if (selectedNode !== null) {
        dispatch(selectNode({
          ...selectedNode, data: {
            ...selectedNode.data, parameters: selectedNode.data.parameters.map((p) => {
              if (p.selected) return { ...p, selected: false, source: parameterSources }
              return { ...p, selected: false }
            })
          }
        }))
        updateNode(selectedNode)
        initNodes(nodes.map((n) => {
          if (n.type !== "stackNode" || (selectedNode.data.parameters.filter(p => p.selected)).length == 0) return n
          const parameter = selectedNode.data.parameters.filter(p => p.selected)[0]

          let newNode: StackNode = {
            ...n, data: {
              ...n.data, outputs: (n as StackNode).data.outputs.map((o) => {
                return {
                  ...o, target: o.target.map(t => {
                    if (t.node.id === selectedNode.id) return { ...t, parameter: parameter }
                    return t
                  })
                }
              })
            }
          }
          return newNode
        }))

        const parameter = selectedNode.data.parameters.filter(p => p.selected)[0]
        parameterSources.forEach((p) => {
          addEdge({
            id: `${p.node.id}/${p.output.name}-${selectedNode.id}/${parameter.name}`,
            source: selectedNode.id,
            sourceHandle: `${selectedNode.data.nodeName}/${parameter.name}`,
            target: p.node.id,
            targetHandle: `${p.node.data.nodeName}/${p.output.name}`,
            updatable: true,
            label: `${p.node.data.nodeName}/${p.output.name}-${selectedNode.data.nodeName}/${parameter.name}`,
          })
        })

      }
    }
    dispatch(closeEditParameterSourceDialog())
  }

  return (
    <div>
      <Dialog open={open} onClose={() => onClose(false)}>
        <DialogTitle>Edit Parameter's source</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          {selectedNode !== null &&
            selectedNode.data.parameters.map((p) => {
              if (p.selected) {
                return (
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
                      value={p.name}
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
                      value={p.description}
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
                      id="type"
                      label="Type"
                      type={"tex"}
                      key={"Type"}
                      fullWidth
                      variant="outlined"
                      value={p.type}
                      disabled
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "black",
                        },
                      }}
                    />
                    <FormControl sx={{ m: 1, width: 300 }}>
                      <InputLabel id="source">Source</InputLabel>
                      <Select
                        labelId="source-selection"
                        id="source-selection"
                        multiple
                        key={"Source"}
                        value={parameterSources.map(p => `${p.node.data.nodeName}/${p.output.name}`)}
                        // value={parameterSources}
                        onChange={handleChange}
                        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                        fullWidth
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: "auto" }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                        MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: "auto" } } }}
                      >
                        {selectableOutputs.map((o) => (
                          <MenuItem
                            key={`${o.node.data.nodeName}/${o.output.name}`}
                            value={`${o.node.data.nodeName}/${o.output.name}`}
                          // style={getStyles(name, parameters, theme)}
                          >
                            {`${o.node.data.nodeName}/${o.output.name}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )
              }
            })
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
  );
}


export const EditOutputTargetDialog: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, mergeNodes, updateNode, deleteNode, initNodes, addEdge } = useStore(selector, shallow);
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectEditOutputTargetDialog)
  const selectedNode = useAppSelector(selectSelectedNode)
  const [selectableParameters, setSelectableParameters] = React.useState<StackNodeOutputTarget[]>([])
  const [outputTargets, setOutputTargets] = React.useState<StackNodeOutputTarget[]>([])

  React.useEffect(() => {
    console.log("init parameter sources")
    if (selectedNode === null) return
    if ((selectedNode.data.outputs.filter(o => o.selected)).length == 0) return
    const output = selectedNode.data.outputs.filter(o => o.selected)[0]

    const targetParameters = nodes.filter((n) => n.type === "stackNode").map((n: StackNode) => {
      return n.data.parameters.filter(p => p.source.filter(s => s.output.name === output.name).length > 0).map((p) => {
        return { node: n, parameter: p as ParameterSummary }
      })
    }).flat()
    setOutputTargets(targetParameters)
  }, [])

  React.useEffect(() => {
    console.log("get selectable parameters")
    const parameters = nodes.filter((n) => n.type === "stackNode").map((n: StackNode) => {
      return n.data.parameters.filter((p) => p.visible && n.data.nodeName !== selectedNode?.data.nodeName).map((p) => {
        return { node: n, parameter: p }
      })
    }).flat()
    console.log(nodes)
    setSelectableParameters(parameters)
  }, [selectedNode])

  const getStackNodeOutputTarget = (value: string): StackNodeOutputTarget | null => {
    const nodeName = value.split("/")[0]
    const parameterName = value.split("/")[1]
    const node: StackNode[] = nodes.filter((n) => n.type === "stackNode").filter((n: StackNode) => n.data.nodeName === nodeName)
    if (node.length === 1) {
      const parameter = node[0].data.parameters.filter((p) => p.name === parameterName)
      if (parameter.length === 1) {
        return { parameter: parameter[0], node: node[0] }
      }
    }
    return null
  }

  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const { target: { value } } = event;
    console.log(value)
    if (typeof value === "string") {
      const target = getStackNodeOutputTarget(value)
      if (target === null) return
      setOutputTargets([target])
    }
    if (Array.isArray(value)) {
      setOutputTargets(value.map(
        v => getStackNodeOutputTarget(v)
      ).filter((v): v is StackNodeOutputTarget => v !== null)
      )
    }

  };


  const onClose = (submit: boolean) => {
    setSelectableParameters([])
    setOutputTargets([])
    if (submit === true) {
      if (selectedNode !== null) {
        dispatch(selectNode({
          ...selectedNode, data: {
            ...selectedNode.data, outputs: selectedNode.data.outputs.map((o) => {
              if (o.selected) return { ...o, selected: false, target: outputTargets }
              return { ...o, selected: false }
            })
          }
        }))
        updateNode(selectedNode)
        initNodes(nodes.map((n) => {
          if (n.type !== "stackNode" || (selectedNode.data.outputs.filter(o => o.selected)).length == 0) return n
          const output = selectedNode.data.outputs.filter(o => o.selected)[0]

          let newNode: StackNode = {
            ...n, data: {
              ...n.data, parameters: (n as StackNode).data.parameters.map((p) => {
                return {
                  ...p, source: p.source.map(s => {
                    if (s.node.id === selectedNode.id) return { ...s, output: output }
                    return s
                  })
                }
              })
            }
          }
          return newNode
        }))
        const output = selectedNode.data.outputs.filter(o => o.selected)[0]
        outputTargets.forEach((o) => {
          addEdge({
            id: `${o.node.id}/${o.parameter.name}-${selectedNode.id}/${output.name}`,
            source: o.node.id,
            sourceHandle: `${o.node.data.nodeName}/${o.parameter.name}`,
            target: selectedNode.id,
            targetHandle: `${selectedNode.data.nodeName}/${output.name}`,
            updatable: true,
            label: `${o.node.id}/${o.parameter.name}-${selectedNode.id}/${output.name}`,
          })
        })

      }
    }
    dispatch(closeEditOutputTargetDialog())
  }

  return (
    <div>
      <Dialog open={open} onClose={() => onClose(false)}>
        <DialogTitle>Edit Output's source</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          {selectedNode !== null &&
            selectedNode.data.outputs.map((o) => {
              if (o.selected) {
                return (
                  <>
                    <TextField
                      autoFocus={false}
                      margin="normal"
                      id="name"
                      label="Name"
                      type={"tex"}
                      fullWidth
                      variant="outlined"
                      value={o.name}
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
                      type={"tex"}
                      fullWidth
                      variant="outlined"
                      value={o.description}
                      disabled
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "black",
                        },
                      }}
                    />
                    <FormControl sx={{ m: 1, width: 300 }}>
                      <InputLabel id="target">Target</InputLabel>
                      <Select
                        labelId="target-selection"
                        id="target-selection"
                        multiple
                        value={outputTargets.map(o => `${o.node.data.nodeName}/${o.parameter.name}`)}
                        // value={parameterSources}
                        onChange={handleChange}
                        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              // <Chip key={`${value.node.data.nodeName}/${value.output.name}`} label={`${value.node.data.nodeName}/${value.output.name}`} />
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                        MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: 250 } } }}
                      >
                        {selectableParameters.map((p) => (
                          <MenuItem
                            key={`${p.node.data.nodeName}/${p.parameter.name}`}
                            value={`${p.node.data.nodeName}/${p.parameter.name}`}
                          // style={getStyles(name, parameters, theme)}
                          >
                            {`${p.node.data.nodeName}/${p.parameter.name}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )
              }
            })
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
  );
}


export default function FlowDetail() {


  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  const selectedNode = useAppSelector(selectSelectedNode)
  const EditParameterSourceDialogOpened = useAppSelector(selectEditParameterSourceDialog)
  const EditOutputTargetDialogOpened = useAppSelector(selectEditOutputTargetDialog)
  const nodeEditDrawerOpened = useAppSelector(selectNodeEditDrawer)
  const parameterRowSelectionModel = useAppSelector(selectParameterRowSelectionModel)
  const outputRowSelectionModel = useAppSelector(selectOutputRowSelectionModel)

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, mergeNodes, updateNode, deleteNode } = useStore(selector, shallow);

  // const [parameterRowSelectionModel, setParameterRowSelectionModel] = React.useState<GridRowSelectionModel>([]);




  const templates = useAppSelector(selectTemplates)
  const [searchWord, setSearchWord] = React.useState<string>("")

  const [open, setOpen] = React.useState(true)

  const reactFlowInstance = useAppSelector(selectReactFlowInstance)

  const handleParametersDependencyClick = React.useCallback(
    (params: GridRowParams) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation()
      console.log(params)

      if (selectedNode === null) {
        console.log("return")
        return
      }
      dispatch(selectNode({
        ...selectedNode, data: {
          ...selectedNode.data, parameters: selectedNode.data.parameters.map((p) => {
            return { ...p, selected: p.name === params.id }
          })
        }
      }))
      dispatch(openEditParameterSourceDialog())
    },
    [selectedNode]
  )
  const handleOutputsDependencyClick = React.useCallback(
    (params: GridRowParams) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation()
      console.log(params)
      if (selectedNode === null) {
        return
      }
      dispatch(selectNode({
        ...selectedNode, data: {
          ...selectedNode.data, outputs: selectedNode.data.outputs.map((o) => {
            return { ...o, selected: o.name === params.id }
          })
        }
      }))
      dispatch(openEditOutputTargetDialog())

    },
    [selectedNode]
  )
  const getParametersDependencyAction = React.useCallback(
    (params: GridRowParams) => {
      if (selectedNode === null) {
        return []
      }
      const param = selectedNode.data.parameters.find((p) => p.name === params.id)
      const isVisible = param !== undefined ? param.visible : false
      return [
        <GridActionsCellItem
          icon={isVisible ? <EditIcon color='primary' /> : <HorizontalRuleIcon />}
          label='source'
          onClick={handleParametersDependencyClick(params)}
          color='inherit'
          disabled={!isVisible}
        />
      ]
    }, [handleParametersDependencyClick])
  const getOutputsDependencyAction = React.useCallback(
    (params: GridRowParams) => {
      if (selectedNode === null) {
        return []
      }
      const output = selectedNode.data.outputs.find((o) => o.name === params.id)
      const isVisible = output !== undefined ? output.visible : false
      return [
        <GridActionsCellItem
          icon={isVisible ? <EditIcon color='primary' /> : <HorizontalRuleIcon />}
          label='target'
          onClick={handleOutputsDependencyClick(params)}
          color='inherit'
          disabled={!isVisible}
        />
      ]
    }, [handleOutputsDependencyClick])

  const parametersCols: GridColDef[] = [
    {
      field: "source", headerName: "Source", align: "center", flex: 1,
      type: "actions", getActions: getParametersDependencyAction
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
      type: "actions", getActions: getOutputsDependencyAction,
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
          return { ...p, visible: false, source: [], selected: false }
        })
        dispatch(setParameterRowSelectionModel([]))
      } catch (e) {
        console.error(e)
      }
      try {
        const response = await getTemplateSummary(event.target.value, "Outputs")
        newNode.data.outputs = (response.templateSummary.summary as OutputSummary[]).map((p) => {
          return { ...p, visible: false, target: [], selected: false }
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
        return { ...p, visible: e.includes(p.name as string) || p.source.length > 0 }
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
        return { ...o, visible: e.includes(o.name as string) || o.target.length > 0 }
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
        {EditParameterSourceDialogOpened && <EditParameterSourceDialog />}
        {EditOutputTargetDialogOpened && <EditOutputTargetDialog />}
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