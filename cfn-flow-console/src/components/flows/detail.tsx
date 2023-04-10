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
import { DataGrid, GridActionsCellItem, GridColDef, GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid';
import axios from 'axios';
import { shallow } from 'zustand/shallow';
import { getRegions } from '../../apis/common';
import { getTemplateSummary, getTemplates } from '../../apis/templates/api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { RFState, closeEditIODialog, closeNodeEditDrawe as closeNodeEditDrawer, openEditIODialog, selectEditIODialog, selectNode, selectNodeEditDrawer, selectSelectedFlow, selectSelectedNode } from '../../stores/flows/main';
import { createTemplates, selectTemplates } from '../../stores/templates/main';
import { useStore } from './../../stores/flows/main';

const leftDrawerWidth = 240;
const rightDrawerWidth = 720;

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

const selector = (state:RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setNodes: state.setNodes,
});

export const EditIODialog: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, } = useStore(selector, shallow);
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectEditIODialog)
  const selectedNode = useAppSelector(selectSelectedNode)
  const [personName, setPersonName] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };
  
    // const names = nodes.map((n:StackNode) => n.data.parameters);
    var names:string[] = []
    if (nodes.length > 1) {
      // const n:StackNode = (nodes as StackNode[])[1]
      names = n.data.outputs.map((o) => o.name)
      console.log(nodes)
    }
    // const names:string[] = (nodes as StackNode[])[0].data.outputs.map((o:OutputSummary) => o.name)



    const onClose = () => {
      dispatch(closeEditIODialog())
      if (selectedNode === null) return
      dispatch(selectNode({
        ...selectedNode, data: {
          ...selectedNode.data, parameters: selectedNode.data.parameters.map((p) => {
            return { ...p, selected: false }
          })
        }
      }))
    }


    return (
      <div>
        <Dialog open={open} onClose={() => onClose()}>
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
                          value={personName}
                          onChange={handleChange}
                          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} />
                              ))}
                            </Box>
                          )}
                          MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: 250 } } }}
                        >
                          {names.map((name) => (
                            <MenuItem
                              key={name}
                              value={name}
                            // style={getStyles(name, personName, theme)}
                            >
                              {name}
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
                onClick={() => onClose()}
                variant={"contained"}
              >
                OK
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
    const nodeEditDrawerOpened = useAppSelector(selectNodeEditDrawer)

    const templates = useAppSelector(selectTemplates)
    const [searchWord, setSearchWord] = React.useState<string>("")

    const [open, setOpen] = React.useState(true)

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
        dispatch(openEditIODialog())
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
        dispatch(openEditIODialog())

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
      }, [handleParametersDependencyClick])

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
            return { ...p, visible: false, src: [], selected: false }
          })
        } catch (e) {
          console.error(e)
        }
        try {
          const response = await getTemplateSummary(event.target.value, "Outputs")
          newNode.data.outputs = (response.templateSummary.summary as OutputSummary[]).map((p) => {
            return { ...p, visible: false }
          })
        } catch (e) {
          console.error(e)
        }
      }
      dispatch(selectNode(newNode))
      console.log(event.target.value)

    }

    const onRowSelectionChange = (e: GridRowSelectionModel, sectionName: TemplateSummarySection) => {
      console.log(e)
      if (selectedNode === null) {
        return
      }
      if (sectionName === "Parameters") {
        const newParameters = selectedNode.data.parameters.map((p) => {
          return { ...p, visible: e.includes(p.name as string) }
        })
        dispatch(selectNode({
          ...selectedNode, data: {
            ...selectedNode.data, parameters: newParameters
          }
        }))
      }
      if (sectionName === "Outputs") {
        const newOutputs = selectedNode.data.outputs.map((p) => {
          return { ...p, visible: e.includes(p.name as string) }
        })
        dispatch(selectNode({
          ...selectedNode, data: {
            ...selectedNode.data, outputs: newOutputs
          }
        }))

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
          <EditIODialog />
          <Grid item sx={{ height: "80vh" }} xs={true}>
            <FlowCanvas />
          </Grid>
          {nodeEditDrawerOpened &&
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
                    <Button variant={"contained"}>DELETE NODE</Button>
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