import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
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
import { Container, ListItemIcon, Stack } from '@mui/material';
import { Routes, Route, NavLink, useLocation, Link as RouterLink, BrowserRouter } from 'react-router-dom';
import { Breadcrumbs, Link, LinkProps } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutIcon from '@mui/icons-material/Logout';
import Grid from '@mui/material/Grid';
import Button from "@mui/material/Button"
import FlowCanvas from './flow';
import ReactFlow, { Background, BackgroundVariant } from 'reactflow';

import 'reactflow/dist/style.css';

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



export default function FlowDetail() {

  const [open, setOpen] = React.useState(true)

  return (
    <Stack spacing={2} direction={"column"}>
      <Stack direction={"row"}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='h6'>test</Typography>
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
      <CssBaseline/>
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
              <ListItem key={"Templates"} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemText primary={<NavLink to={"flows"}><ListItemText primary={"hoge"} /></NavLink>} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
              <ListItem key={"Templates"} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemText primary={<NavLink to={"flows"}><ListItemText primary={"hoge"} /></NavLink>} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
              <ListItem key={"Templates"} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemText primary={<NavLink to={"flows"}><ListItemText primary={"hoge"} /></NavLink>} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
        </Grid>
        <Grid item sx={{height: "80vh"}} xs={true}>
        <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
          <Background variant={BackgroundVariant.Cross}/>
        </ReactFlow>
        </Grid>
      </Grid>

    </Stack>
  );
}