import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button"
import { Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { select, selectSelectedTemplate } from "../../stores/templates/main"
import {
  createDialogClose, selectCreateDialog,
  editDialogClose, selectEditDialog,
  deleteDialogClose, selectDeleteDialog,
} from '../../stores/templates/common';

export const CreateTemplateDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectCreateDialog)
  enum TemplateSourceType {
    S3 = 1,
    Local = 2
  }
  const [templateSourceType, setTemplateSourceType] = React.useState(TemplateSourceType.S3)
  const [localFile, setLocalFile] = React.useState("")


  const onTemplateSourceTypehange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateSourceType(Number(e.target.value))
  }
  const onSelectLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      setLocalFile(e.target.files[0].name)
    }
  }


  return (
    <div>
      <Dialog open={open} onClose={() => (dispatch(createDialogClose()))}>
        <DialogTitle>New Template</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Template Name"
            type={"tex"}
            fullWidth
            variant="outlined"
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
          />

          <FormControl>
            <FormLabel id="template-source">Template source</FormLabel>
            <RadioGroup
              row
              aria-labelledby="template-source"
              name="row-radio-buttons-group"
              onChange={onTemplateSourceTypehange}
            >
              <FormControlLabel
                value={TemplateSourceType.S3}
                control={<Radio />}
                label="Amazon S3 URL"
                checked={templateSourceType === TemplateSourceType.S3}
              />
              <FormControlLabel
                value={TemplateSourceType.Local}
                control={<Radio />}
                label="Upload local file"
                checked={templateSourceType === TemplateSourceType.Local}
              />
            </RadioGroup>
          </FormControl>
          {templateSourceType === TemplateSourceType.S3
            ?
            <Stack direction={"row"} spacing={2}>
              <TextField
                autoFocus
                margin="normal"
                id="url"
                label="Template URL"
                type={"url"}
                fullWidth
                variant="outlined"
              />
            </Stack>
            :
            <Stack direction={"row"} spacing={2}>
              <Stack direction={"row"} spacing={2}>
                <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
                  Upload
                  <input hidden accept=".json,.yaml" multiple={false} type="file" onChange={onSelectLocalFile} />
                </Button>
                <Typography>{localFile}</Typography>
              </Stack>
            </Stack>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (dispatch(createDialogClose()))}>CANCEL</Button>
          <Button onClick={() => (dispatch(createDialogClose()))} variant={"contained"}>CREATE</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


export const EditTemplateDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectEditDialog)
  const selectedTemplate = useAppSelector(selectSelectedTemplate)
  enum TemplateSourceType {
    S3 = 1,
    Local = 2
  }
  const [templateSourceType, setTemplateSourceType] = React.useState(TemplateSourceType.S3)
  const [localFile, setLocalFile] = React.useState("")

  const onTemplateSourceTypehange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateSourceType(Number(e.target.value))
  }
  const onSelectLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      setLocalFile(e.target.files[0].name)
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={() => (dispatch(editDialogClose()))}>
        <DialogTitle>Edit {selectedTemplate?.name}</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Template Name"
            type={"tex"}
            fullWidth
            variant="outlined"
            value={selectedTemplate?.name}
            disabled={true}
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
            value={selectedTemplate?.description}
          />
          <FormControl>
            <FormLabel id="template-source">Template source</FormLabel>
            <RadioGroup
              row
              aria-labelledby="template-source"
              name="row-radio-buttons-group"
              onChange={onTemplateSourceTypehange}
            >
              <FormControlLabel
                value={TemplateSourceType.S3}
                control={<Radio />}
                label="Amazon S3 URL"
                checked={templateSourceType === TemplateSourceType.S3}
              />
              <FormControlLabel
                value={TemplateSourceType.Local}
                control={<Radio />}
                label="Upload local file"
                checked={templateSourceType === TemplateSourceType.Local}
              />
            </RadioGroup>
          </FormControl>
          {templateSourceType === TemplateSourceType.S3
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
                value={selectedTemplate?.httpUrl}
              />
            </Stack>
            :
            <Stack direction={"row"} spacing={2}>
              <Stack direction={"row"} spacing={2}>
                <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
                  Upload
                  <input hidden accept=".json,.yaml" multiple={false} type="file" onChange={onSelectLocalFile} />
                </Button>
                <Typography>{localFile}</Typography>
              </Stack>
            </Stack>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (dispatch(editDialogClose()))}>CANCEL</Button>
          <Button onClick={() => (dispatch(editDialogClose()))} variant={"contained"}>EDIT</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export const DeleteTemplateDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector(selectDeleteDialog)
  const selectedTemplate = useAppSelector(selectSelectedTemplate)

  return (
    <div>
      <Dialog open={open} onClose={() => (dispatch(deleteDialogClose()))}>
        <DialogTitle>Delete {selectedTemplate?.name}?</DialogTitle>
        <DialogContent sx={{ margin: "100" }}>
          <DialogContentText>
            Are you sure that you want to delete template {selectedTemplate?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (dispatch(deleteDialogClose()))}>CANCEL</Button>
          <Button onClick={() => (dispatch(deleteDialogClose()))} variant={"contained"}>DELETE</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
