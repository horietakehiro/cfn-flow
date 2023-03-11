import * as React from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';

import { TemplatesTable } from './table';
import { TemplatesDetail } from './detail';

export const TemplatesMainMenu: React.FC = () => {

  var { templateId } = useParams();
  console.log(`templateid ${templateId}`)

  const [detailPageOpen, setDetailPageOpen] = React.useState(false)
  const [selectedTemplate, setSelectedTemplate] = React.useState(templateId ? templateId : "")

  return (
    <Box sx={{ width: '100%' }}>
      {!templateId ?
        <TemplatesTable
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          setDetailPageOpen={setDetailPageOpen}
        /> :
        <TemplatesDetail
          selectedTemplate={selectedTemplate}
        />
      }
    </Box >
  );
}

