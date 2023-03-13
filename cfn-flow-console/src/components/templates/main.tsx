import * as React from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';

import { TemplatesTable } from './table';
import { TemplateDetail } from './detail';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { select, selectSelectedTemplate } from "../../stores/templates/main"

export const TemplatesMainMenu: React.FC = () => {

  var { templateId } = useParams();
  console.log(`templateid ${templateId}`)

  // const [selectedTemplate, setSelectedTemplate] = React.useState(templateId ? templateId : "")
  const selectedTemplate = useAppSelector(selectSelectedTemplate)
  const dispatch = useAppDispatch()

  return (
    <Box sx={{ width: '100%' }}>
      {!templateId ? <TemplatesTable/> : <TemplateDetail/>}
    </Box >
  );
}

