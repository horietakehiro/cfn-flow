import * as React from 'react';
import { styled, Theme, CSSObject, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Container, ListItemIcon, Stack, TextField } from '@mui/material';
import { Routes, Route, NavLink, useLocation, Link as RouterLink, BrowserRouter } from 'react-router-dom';
import { Breadcrumbs, Link, LinkProps } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutIcon from '@mui/icons-material/Logout';
import Grid from '@mui/material/Grid';
import Button from "@mui/material/Button"
import FlowCanvas from './flow';
import ReactFlow, { Background, BackgroundVariant, NodeTypes, ReactFlowInstance } from 'reactflow';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';

import {ReactComponent as TemplateSVG} from "../../images/Res_AWS-CloudFormation_Template_48_Light.svg"

// import 'reactflow/dist/style.css';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createTemplates, selectTemplates } from '../../stores/templates/main';
import { API } from "aws-amplify"
import { getApiAuth } from './common';
import axios from 'axios';
import {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { selectSelectedFlow } from '../../stores/flows/main';
import { getTemplates } from '../../apis/templates/api';
const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
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


const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    // marginLeft: 0,
  }),
}));
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing("11", "11"),
  // necessary for content to be below app bar
  justifyContent: 'flex-end',
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    // position: "relative",
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
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

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function FlowDetail() {

  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  const templates = useAppSelector(selectTemplates)
  const [searchWord, setSearchWord] = React.useState<string>("")
  const initialNodes = [
    {
      id: '1',
      type: 'input',
      data: { label: 'input node' },
      position: { x: 250, y: 5 },
    },
  ];
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);


  const [open, setOpen] = React.useState(true)

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

  })


  const onDragStart = (event: React.DragEvent<HTMLLIElement>, nodeType: string) => {
    if (event.dataTransfer !== null) {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    }
  };
  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (reactFlowWrapper.current !== null) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');

        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }

        if (reactFlowInstance !== null) {
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });
          const newNode = {
            id: getId(),
            type,
            position,
            data: { label: `${type} node` },
          };

          setNodes((nds) => nds.concat(newNode));
        }
      }

    },
    [reactFlowInstance]
  );
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
          <Drawer
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
            <DrawerHeader>
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
            </DrawerHeader>
            <Divider />
            <List>
              {templates.map((t, i) => {
                if (t.name.includes(searchWord)) {
                  return (
                    <ListItem key={`template-${i}`} disablePadding sx={{ display: 'block' }} draggable onDragStart={(event) => onDragStart(event, "default")}>
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
                        <ListItemIcon sx={{opacity: open ? 1 : 0}}>
                          <TemplateSVG />
                        </ListItemIcon>
                        {/* <ListItemText primary={<NavLink to={`/templates/${t.name}`}><ListItemText primary={t.name} /></NavLink>} sx={{ opacity: open ? 1 : 0 }} /> */}
                        <TextField
                          id="name" label="Template" variant="outlined"
                          value={t.name}
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
                    // <div id={`t-${i}`} draggable onDragStart={(event) => onDragStart(event, "default")} style={{ cursor: "grab" }}>hogefuga</div>
                  )
                }
              })}
            </List>
          </Drawer>
        </Grid>
        <Grid item sx={{ height: "80vh" }} xs={true}>
          <ReactFlowProvider>
            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ height: "80vh" }}>
              <ReactFlow
                fitView
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                // onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <Background variant={BackgroundVariant.Cross} />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </Grid>
      </Grid>

    </Stack>
  );
}