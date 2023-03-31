import Box from '@mui/material/Box';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import FlowDetail from './detail';
import { FlowsTable } from './table';
// import { FlowDetail } from './detail';

export const FlowsMainMenu: React.FC = () => {

  var { flowName } = useParams();

  React.useEffect(() => {}, [])

  return (
    <Box sx={{ width: '100%' }}>
      {!flowName ? <FlowsTable/> : <FlowDetail/>}
    </Box >
  );
}

