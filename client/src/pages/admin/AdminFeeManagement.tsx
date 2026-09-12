import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

import FeeStructurePage from '../../components/admin/Fees/FeeStructurePage';
import AssignFeePage from '../../components/admin/Fees/AssignFeePage';
import CollectPaymentPage from '../../components/admin/Fees/CollectPaymentPage';
import DuesPage from '../../components/admin/Fees/DuesPage';

const AdminFeeManagement: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Fee Structures" />
        <Tab label="Assign Fees" />
        <Tab label="Collect Payment" />
        <Tab label="Dues & Reports" />
      </Tabs>

      {tab === 0 && <FeeStructurePage />}
      {tab === 1 && <AssignFeePage />}
      {tab === 2 && <CollectPaymentPage />}
      {tab === 3 && <DuesPage />}
    </Box>
  );
};

export default AdminFeeManagement;