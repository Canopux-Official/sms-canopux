import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import type { StudentMarkRow } from './services/StudentMarksApi';
import type { ReportInstitute, ReportStudent } from './utils/reportCardRenderer';
import {
  buildFileBaseName,
  buildPdfFromJpeg,
  canvasToBlob,
  downloadBlob,
  renderReportCardCanvas,
} from './utils/reportCardExport';

interface ReportCardDialogProps {
  open: boolean;
  mark: StudentMarkRow | null;
  student: ReportStudent | null;
  institute: ReportInstitute;
  onClose: () => void;
}

type PreviewState = { status: 'loading' } | { status: 'ready'; url: string } | { status: 'error' };

interface ContentProps {
  mark: StudentMarkRow;
  student: ReportStudent | null;
  institute: ReportInstitute;
  onClose: () => void;
}

/**
 * Mounted only while the dialog is open, so every open starts from a clean
 * "loading" state and the generated image is released again on close.
 */
const ReportCardContent: React.FC<ContentProps> = ({ mark, student, institute, onClose }) => {
  const [preview, setPreview] = useState<PreviewState>({ status: 'loading' });
  const [busy, setBusy] = useState<'pdf' | 'image' | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const jpegRef = useRef<Blob | null>(null);

  const fileBase = useMemo(
    () => buildFileBaseName(student?.enrollmentNumber, mark.heading),
    [student?.enrollmentNumber, mark.heading]
  );

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const generate = async () => {
      try {
        const canvas = await renderReportCardCanvas({ mark, student, institute, generatedAt: new Date() });
        const jpeg = await canvasToBlob(canvas, 'image/jpeg', 0.92);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(jpeg);
        canvasRef.current = canvas;
        jpegRef.current = jpeg;
        setPreview({ status: 'ready', url: objectUrl });
      } catch (err) {
        console.error('Error generating report card:', err);
        if (!cancelled) setPreview({ status: 'error' });
      }
    };
    generate();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mark, student, institute]);

  const handleDownloadPdf = async () => {
    const canvas = canvasRef.current;
    const jpeg = jpegRef.current;
    if (!canvas || !jpeg) return;
    setBusy('pdf');
    setDownloadError(null);
    try {
      const bytes = new Uint8Array(await jpeg.arrayBuffer());
      const pdf = buildPdfFromJpeg(bytes, canvas.width, canvas.height, `Report Card - ${mark.heading}`);
      downloadBlob(pdf, `${fileBase}.pdf`);
    } catch (err) {
      console.error('Error creating PDF:', err);
      setDownloadError('Could not create the PDF. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy('image');
    setDownloadError(null);
    try {
      const png = await canvasToBlob(canvas, 'image/png');
      downloadBlob(png, `${fileBase}.png`);
    } catch (err) {
      console.error('Error creating image:', err);
      setDownloadError('Could not create the image. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const ready = preview.status === 'ready';

  return (
    <>
      <DialogTitle
        id="report-card-title"
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, pr: 1.5 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="span" fontWeight={700} display="block">
            Report Card
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {mark.heading}
          </Typography>
        </Box>
        <IconButton aria-label="Close report card" onClick={onClose} edge="end" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#e9eef0', p: { xs: 1.5, sm: 3 } }}>
        {downloadError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDownloadError(null)}>
            {downloadError}
          </Alert>
        )}

        {preview.status === 'loading' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              minHeight: 320,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Preparing your report card...
            </Typography>
          </Box>
        )}

        {preview.status === 'error' && (
          <Alert severity="error">
            We could not prepare this report card. Please close this window and try again.
          </Alert>
        )}

        {preview.status === 'ready' && (
          <>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: 'block', sm: 'none' }, textAlign: 'center', mb: 1 }}
            >
              Pinch to zoom, or download for a full-size copy.
            </Typography>
            <Box
              component="img"
              src={preview.url}
              alt={`Report card for ${mark.heading}`}
              sx={{
                display: 'block',
                width: '100%',
                maxWidth: 794,
                mx: 'auto',
                bgcolor: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          '& > :not(style) ~ :not(style)': { ml: 0 },
        }}
      >
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="outlined"
          aria-label="Download image"
          startIcon={busy === 'image' ? <CircularProgress size={16} /> : <ImageOutlinedIcon />}
          onClick={handleDownloadImage}
          disabled={!ready || busy !== null}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, whiteSpace: 'pre' }}>
            {'Download '}
          </Box>
          Image
        </Button>
        <Button
          variant="contained"
          aria-label="Download PDF"
          startIcon={busy === 'pdf' ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />}
          onClick={handleDownloadPdf}
          disabled={!ready || busy !== null}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, whiteSpace: 'pre' }}>
            {'Download '}
          </Box>
          PDF
        </Button>
      </DialogActions>
    </>
  );
};

const ReportCardDialog: React.FC<ReportCardDialogProps> = ({ open, mark, student, institute, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="report-card-title"
    >
      {mark && <ReportCardContent mark={mark} student={student} institute={institute} onClose={onClose} />}
    </Dialog>
  );
};

export default ReportCardDialog;