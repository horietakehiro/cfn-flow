import * as React from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';

import { FlowsTable } from './table';
// import { FlowDetail } from './detail';

export const FlowsMainMenu: React.FC = () => {

  var { flowName } = useParams();

  React.useEffect(() => {}, [])

  return (
    <Box sx={{ width: '100%' }}>
      {!flowName ? <FlowsTable/> : <div>hogefuga</div>}
    </Box >
  );
}

