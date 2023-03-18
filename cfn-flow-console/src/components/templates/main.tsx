import * as React from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';

import { TemplatesTable } from './table';
import { TemplateDetail } from './detail';

export const TemplatesMainMenu: React.FC = () => {

  var { templateName } = useParams();
  // const [selectedTemplate, setSelectedTemplate] = React.useState(templateId ? templateId : "")

  return (
    <Box sx={{ width: '100%' }}>
      {!templateName ? <TemplatesTable/> : <TemplateDetail/>}
    </Box >
  );
}

