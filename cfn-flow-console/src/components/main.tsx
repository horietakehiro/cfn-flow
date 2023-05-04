import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Breadcrumbs, Link, LinkProps, ListItemIcon, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { CSSObject, styled, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { NavLink, Route, Link as RouterLink, Routes, useLocation } from 'react-router-dom';

import {
  WithAuthenticatorProps
} from '@aws-amplify/ui-react';

import { TemplatesMainMenu } from './templates/main';

import { useAppDispatch, useAppSelector } from '../hooks';
import { invert, selectLeftDrawer } from "../stores/main";
import { FlowsMainMenu } from './flows/main';
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

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing("11", "11"),
  // necessary for content to be below app bar
  justifyContent: 'flex-end',
  ...theme.mixins.toolbar,
}));


const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Hello</div>} />
      <Route path='/templates' element={<TemplatesMainMenu />} />
      <Route path='/templates/:templateName' element={<TemplatesMainMenu />} />
      <Route path='/flows' element={<FlowsMainMenu />} />
      <Route path='/flows/:flowName' element={<FlowsMainMenu />} />
      <Route path='/flows/:flowName/deployments' element={<FlowsMainMenu />} />

    </Routes>
  );
}
interface LinkRouterProps extends LinkProps {
  to: string
  replace?: boolean
}
const LinkRouter = (props: LinkRouterProps) => <Link {...props} component={RouterLink as any} />
const MainHeader = () => {
  const location = useLocation()
  const pathElems = location.pathname.split("/").filter((p) => p)

  var breadcrumbs = [
    <LinkRouter underline="hover" key="1" color="inherit" to="/">
      cfn-flow
    </LinkRouter >
  ]

  breadcrumbs = breadcrumbs.concat(
    pathElems.map((value, index) => {
      const last = index === pathElems.length - 1
      const to = `/${pathElems.slice(0, index + 1).join("/")}`
      return last ? (
        <Typography key={to}>{value}</Typography>
      ) : (
        <LinkRouter underline="hover" key={index} color="inherit" to={to}>{value}</LinkRouter>
      )
    })
  )

  return (
    <Stack spacing={2}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>
    </Stack>
  );
}

export default function MainOutline({ signOut, user }: WithAuthenticatorProps) {
  // const [open, setOpen] = React.useState(false);
  const open = useAppSelector(selectLeftDrawer)
  const dispatch = useAppDispatch()

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={() => (dispatch(invert()))}
            sx={{ px: 0.5 }}
            data-testid="left-drawer-button"
          >
            {open ? <ChevronLeftIcon data-testid="left-drawer-close-button" /> : <MenuIcon data-testid="left-drawer-open-button" />}
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
              <ListItemText primary={<NavLink to={"flows"}><ListItemText primary={"Flows"} /></NavLink>} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>

            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemText primary={<NavLink to={"templates"}><ListItemText primary={"Templates"} /></NavLink>} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem key={"Signout"} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
              onClick={signOut}
            >
              <ListItemIcon sx={{ opacity: open ? 1 : 0 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={"Sign out"} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Main open>
        <Stack direction={"column"} spacing={2}>
          <MainHeader />
          <Router />
        </Stack>
      </Main>
    </Box>
  );
}