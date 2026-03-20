// // AttendanceHeader.tsx

// import React, { useState } from 'react';
// import {
//   Box,
//   Button,
//   Typography,
//   Stack,
//   Chip,
//   Menu,
//   MenuItem,
//   IconButton,
//   useMediaQuery,
//   useTheme,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
// } from '@mui/material';
// import {
//   Save as SaveIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon,
//   MoreVert as MoreVertIcon,
// } from '@mui/icons-material';

// interface AttendanceHeaderProps {
//   monthName: string;
//   year: number;
//   dirtyCount: number;
//   dayHeaders: number[];
//   isCurrentMonth: boolean;
//   syncing: boolean;
//   onMarkAllPresent: (day: number) => void;
//   onMarkAllAbsent: (day: number) => void;
//   onSaveChanges: () => Promise<any>;
// }

// export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
//   monthName,
//   year,
//   dirtyCount,
//   dayHeaders,
//   isCurrentMonth,
//   syncing,
//   onMarkAllPresent,
//   onMarkAllAbsent,
//   onSaveChanges,
// }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [selectedDay, setSelectedDay] = useState<number | null>(null);
//   const [saveDialogOpen, setSaveDialogOpen] = useState(false);

//   const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setSelectedDay(null);
//   };

//   const handleDaySelect = (day: number) => {
//     setSelectedDay(day);
//   };

//   const handleMarkPresent = () => {
//     if (selectedDay) {
//       onMarkAllPresent(selectedDay);
//     }
//     handleMenuClose();
//   };

//   const handleMarkAbsent = () => {
//     if (selectedDay) {
//       onMarkAllAbsent(selectedDay);
//     }
//     handleMenuClose();
//   };

//   const handleSaveClick = () => {
//     if (dirtyCount === 0) return;
//     setSaveDialogOpen(true);
//   };

//   const handleConfirmSave = async () => {
//     try {
//       await onSaveChanges();
//       setSaveDialogOpen(false);
//     } catch (error) {
//       // Error handling is done in parent
//     }
//   };

//   const getTodayDate = () => {
//     if (!isCurrentMonth) return null;
//     const today = new Date().getDate();
//     return dayHeaders.includes(today) ? today : null;
//   };

//   const todayDate = getTodayDate();

//   return (
//     <>
//       <Box
//         sx={{
//           p: { xs: 2, md: 3 },
//           backgroundColor: 'background.paper',
//           borderRadius: 2,
//           boxShadow: 1,
//         }}
//       >
//         <Stack
//           direction={{ xs: 'column', sm: 'row' }}
//           justifyContent="space-between"
//           alignItems={{ xs: 'flex-start', sm: 'center' }}
//           spacing={2}
//         >
//           <Box>
//             <Typography variant="h5" component="h1" fontWeight="bold">
//               Attendance Management
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               {monthName} {year}
//               {dirtyCount > 0 && (
//                 <Chip
//                   label={`${dirtyCount} unsaved ${
//                     dirtyCount === 1 ? 'change' : 'changes'
//                   }`}
//                   size="small"
//                   color="warning"
//                   sx={{ ml: 1 }}
//                 />
//               )}
//             </Typography>
//           </Box>

//           <Stack direction="row" spacing={1}>
//             {/* Quick Mark Today - Only on current month */}
//             {todayDate && !isMobile && (
//               <>
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   startIcon={<CheckCircleIcon />}
//                   onClick={() => onMarkAllPresent(todayDate)}
//                   sx={{ whiteSpace: 'nowrap' }}
//                 >
//                   Mark All Present (Today)
//                 </Button>
//               </>
//             )}

//             {/* Mark All Menu for other days */}
//             {!isMobile && (
//               <>
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   onClick={handleMenuOpen}
//                   sx={{ whiteSpace: 'nowrap' }}
//                 >
//                   Mark All (Select Day)
//                 </Button>
//                 <Menu
//                   anchorEl={anchorEl}
//                   open={Boolean(anchorEl) && !selectedDay}
//                   onClose={handleMenuClose}
//                   PaperProps={{
//                     style: {
//                       maxHeight: 300,
//                     },
//                   }}
//                 >
//                   {dayHeaders.map((day) => (
//                     <MenuItem
//                       key={day}
//                       onClick={() => handleDaySelect(day)}
//                       selected={day === todayDate}
//                     >
//                       {day === todayDate ? `Day ${day} (Today)` : `Day ${day}`}
//                     </MenuItem>
//                   ))}
//                 </Menu>

//                 {selectedDay && (
//                   <Menu
//                     anchorEl={anchorEl}
//                     open={Boolean(selectedDay)}
//                     onClose={handleMenuClose}
//                   >
//                     <MenuItem onClick={handleMarkPresent}>
//                       <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
//                       Mark All Present (Day {selectedDay})
//                     </MenuItem>
//                     <MenuItem onClick={handleMarkAbsent}>
//                       <CancelIcon fontSize="small" sx={{ mr: 1 }} />
//                       Mark All Absent (Day {selectedDay})
//                     </MenuItem>
//                   </Menu>
//                 )}
//               </>
//             )}

//             {/* Mobile More Menu */}
//             {isMobile && (
//               <IconButton onClick={handleMenuOpen}>
//                 <MoreVertIcon />
//               </IconButton>
//             )}

//             {/* Save Button */}
//             <Button
//               variant="contained"
//               startIcon={syncing ? <CircularProgress size={16} /> : <SaveIcon />}
//               onClick={handleSaveClick}
//               disabled={dirtyCount === 0 || syncing}
//               color="primary"
//             >
//               {syncing ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </Stack>
//         </Stack>
//       </Box>

//       {/* Save Confirmation Dialog */}
//       <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
//         <DialogTitle>Confirm Save Changes</DialogTitle>
//         <DialogContent>
//           <Typography>
//             You are about to save {dirtyCount} attendance{' '}
//             {dirtyCount === 1 ? 'record' : 'records'} to the server. This action
//             cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setSaveDialogOpen(false)} disabled={syncing}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleConfirmSave}
//             variant="contained"
//             disabled={syncing}
//             startIcon={syncing ? <CircularProgress size={16} /> : null}
//           >
//             {syncing ? 'Saving...' : 'Confirm'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };


// AttendanceHeader.tsx

// AttendanceHeader.tsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  ListSubheader,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarMonthIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

interface AttendanceHeaderProps {
  monthName: string;
  year: number;
  dirtyCount: number;
  dayHeaders: number[];
  isCurrentMonth: boolean;
  syncing: boolean;
  onMarkAllPresent: (day: number) => void;
  onMarkAllAbsent: (day: number) => void;
  onSaveChanges: () => Promise<any>;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  monthName,
  year,
  dirtyCount,
  dayHeaders,
  isCurrentMonth,
  syncing,
  onMarkAllPresent,
  onMarkAllAbsent,
  onSaveChanges,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Shared overflow menu (mobile + tablet)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // Desktop: separate day-picker menu
  const [dayMenuAnchorEl, setDayMenuAnchorEl] = useState<null | HTMLElement>(null);
  // Desktop: after day selected, action anchored to same button
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  // Mobile two-step menu state
  const [mobileStep, setMobileStep] = useState<'selectDay' | 'selectAction'>('selectDay');

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const getTodayDate = () => {
    if (!isCurrentMonth) return null;
    const today = new Date().getDate();
    return dayHeaders.includes(today) ? today : null;
  };
  const todayDate = getTodayDate();
  const isCompact = isMobile || isTablet;

  // ─── Overflow Menu (mobile/tablet) ──────────────────────────────────────────

  const handleOverflowOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setMobileStep('selectDay');
    setSelectedDay(null);
  };

  const handleOverflowClose = () => {
    setAnchorEl(null);
    setSelectedDay(null);
    setMobileStep('selectDay');
  };

  const handleMobileDaySelect = (day: number) => {
    setSelectedDay(day);
    setMobileStep('selectAction');
  };

  const handleMobileMarkPresent = () => {
    if (selectedDay) onMarkAllPresent(selectedDay);
    handleOverflowClose();
  };

  const handleMobileMarkAbsent = () => {
    if (selectedDay) onMarkAllAbsent(selectedDay);
    handleOverflowClose();
  };

  // ─── Desktop Day Picker ──────────────────────────────────────────────────────

  const handleDayPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDayMenuAnchorEl(event.currentTarget);
    setActionAnchorEl(event.currentTarget);
    setSelectedDay(null);
  };

  const handleDayPickerClose = () => {
    setDayMenuAnchorEl(null);
    setSelectedDay(null);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setDayMenuAnchorEl(null); // close day list, action menu will open
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedDay(null);
  };

  const handleDesktopMarkPresent = () => {
    if (selectedDay) onMarkAllPresent(selectedDay);
    handleActionClose();
  };

  const handleDesktopMarkAbsent = () => {
    if (selectedDay) onMarkAllAbsent(selectedDay);
    handleActionClose();
  };

  // ─── Save ────────────────────────────────────────────────────────────────────

  const handleSaveClick = () => {
    if (dirtyCount === 0) return;
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      await onSaveChanges();
      setSaveDialogOpen(false);
    } catch (_) {
      // Error handling done in parent
    }
  };

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={{ xs: 2, sm: 1.5 }}
        >
          {/* ── Title + unsaved badge ── */}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              component="h1"
              fontWeight="bold"
              noWrap
            >
              Attendance Management
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 0.5 }}
              flexWrap="wrap"
            >
              <Typography variant="body2" color="text.secondary">
                {monthName} {year}
              </Typography>
              {dirtyCount > 0 && (
                <Chip
                  label={`${dirtyCount} unsaved ${dirtyCount === 1 ? 'change' : 'changes'}`}
                  size="small"
                  color="warning"
                />
              )}
            </Stack>
          </Box>

          {/* ── Actions ── */}
          {isCompact ? (
            /* ---- Mobile / Tablet: save button + overflow icon ---- */
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Mark All buttons visible on tablet too */}
              {isTablet && todayDate && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TodayIcon />}
                  onClick={() => onMarkAllPresent(todayDate)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Today
                </Button>
              )}

              {/* Overflow menu button (always visible on mobile + tablet) */}
              <Tooltip title="Mark attendance for a day">
                <IconButton
                  onClick={handleOverflowOpen}
                  size="small"
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    p: 0.75,
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                size="small"
                startIcon={
                  syncing ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <SaveIcon fontSize="small" />
                  )
                }
                onClick={handleSaveClick}
                disabled={dirtyCount === 0 || syncing}
                color="primary"
                sx={{ whiteSpace: 'nowrap' }}
              >
                {syncing ? 'Saving…' : 'Save'}
              </Button>
            </Stack>
          ) : (
            /* ---- Desktop: full action row ---- */
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {todayDate && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TodayIcon />}
                  onClick={() => onMarkAllPresent(todayDate)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Mark All Present (Today)
                </Button>
              )}

              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarMonthIcon />}
                onClick={handleDayPickerOpen}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Mark All (Select Day)
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={
                  syncing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSaveClick}
                disabled={dirtyCount === 0 || syncing}
                color="primary"
              >
                {syncing ? 'Saving…' : 'Save Changes'}
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* ══ Desktop only: Day-picker menu ════════════════════════════════════ */}
      {!isCompact && (
        <Menu
          anchorEl={dayMenuAnchorEl}
          open={Boolean(dayMenuAnchorEl)}
          onClose={handleDayPickerClose}
          PaperProps={{ sx: { maxHeight: 320, minWidth: 180 } }}
        >
          <ListSubheader>Select a Day</ListSubheader>
          {dayHeaders.map((day) => (
            <MenuItem
              key={day}
              onClick={() => handleDaySelect(day)}
              selected={day === todayDate}
            >
              {day === todayDate ? `Day ${day} (Today)` : `Day ${day}`}
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* ══ Desktop only: Action menu (present / absent) after day selected ══ */}
      {!isCompact && (
        <Menu
          anchorEl={actionAnchorEl}
          open={Boolean(selectedDay) && !Boolean(dayMenuAnchorEl)}
          onClose={handleActionClose}
          PaperProps={{ sx: { minWidth: 220 } }}
        >
          <ListSubheader>Day {selectedDay}</ListSubheader>
          <MenuItem onClick={handleDesktopMarkPresent}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
            <Typography color="success.main">Mark All Present</Typography>
          </MenuItem>
          <MenuItem onClick={handleDesktopMarkAbsent}>
            <CancelIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
            <Typography color="error.main">Mark All Absent</Typography>
          </MenuItem>
        </Menu>
      )}

      {/* ══ Mobile / Tablet: Overflow menu (two-step) ════════════════════════ */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleOverflowClose}
        PaperProps={{ sx: { minWidth: 260, maxHeight: 420 } }}
      >
        {mobileStep === 'selectDay' ? (
          // Step 1 – pick a day
          [
            todayDate && (
              <MenuItem
                key="today-shortcut"
                onClick={() => {
                  onMarkAllPresent(todayDate);
                  handleOverflowClose();
                }}
                sx={{ color: 'success.main' }}
              >
                <TodayIcon fontSize="small" sx={{ mr: 1 }} />
                Mark All Present (Today)
              </MenuItem>
            ),
            todayDate && <Divider key="div-today" />,
            <ListSubheader key="sub-day">Select Day to Mark</ListSubheader>,
            ...dayHeaders.map((day) => (
              <MenuItem
                key={day}
                onClick={() => handleMobileDaySelect(day)}
                selected={day === todayDate}
              >
                <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                {day === todayDate ? `Day ${day} (Today)` : `Day ${day}`}
              </MenuItem>
            )),
          ].filter(Boolean)
        ) : (
          // Step 2 – pick present or absent
          [
            <MenuItem
              key="back"
              onClick={() => setMobileStep('selectDay')}
              dense
              sx={{ py: 0.5 }}
            >
              <ArrowBackIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Back — Day {selectedDay}
              </Typography>
            </MenuItem>,
            <Divider key="d1" />,
            <ListSubheader key="sub-action">Choose Action</ListSubheader>,
            <MenuItem key="present" onClick={handleMobileMarkPresent}>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
              <Typography color="success.main" fontWeight={500}>
                Mark All Present
              </Typography>
            </MenuItem>,
            <MenuItem key="absent" onClick={handleMobileMarkAbsent}>
              <CancelIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
              <Typography color="error.main" fontWeight={500}>
                Mark All Absent
              </Typography>
            </MenuItem>,
          ]
        )}
      </Menu>

      {/* ══ Save Confirmation Dialog ══════════════════════════════════════════ */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm Save Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to save {dirtyCount} attendance{' '}
            {dirtyCount === 1 ? 'record' : 'records'} to the server. This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={syncing}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            disabled={syncing}
            startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {syncing ? 'Saving…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};