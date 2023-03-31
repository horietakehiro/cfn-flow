import Box from '@mui/material/Box';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { TemplateDetail } from './detail';
import { TemplatesTable } from './table';

export const TemplatesMainMenu: React.FC = () => {

  var { templateName } = useParams();
  // const [selectedTemplate, setSelectedTemplate] = React.useState(templateId ? templateId : "")

  React.useEffect(() => {}, [])

  return (
    <Box sx={{ width: '100%' }}>
      {!templateName ? <TemplatesTable/> : <TemplateDetail templateName={templateName}/>}
    </Box >
  );
}

