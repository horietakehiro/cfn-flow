import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { ListItemIcon, Stack, TextField } from '@mui/material';
import Button from "@mui/material/Button";
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { alpha, CSSObject, styled, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import FlowCanvas from './flow';
// import ReactFlow, { Background, BackgroundVariant,  ReactFlowInstance } from 'reactflow';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';

import { ReactComponent as TemplateSVG } from "../../images/Res_AWS-CloudFormation_Template_48_Light.svg";

// import 'reactflow/dist/style.css';
import axios from 'axios';
import { getTemplates } from '../../apis/templates/api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectSelectedFlow } from '../../stores/flows/main';
import { createTemplates, selectTemplates } from '../../stores/templates/main';
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



export default function FlowDetail() {

  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  const templates = useAppSelector(selectTemplates)
  const [searchWord, setSearchWord] = React.useState<string>("")

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
          <FlowCanvas/>
        </Grid>
      </Grid>

    </Stack>
  );
}