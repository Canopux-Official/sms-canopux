import { useEffect, useState } from 'react'
import {
  Dialog, Box, Typography, TextField, IconButton,
  Button, CircularProgress, InputAdornment,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import CheckIcon from '@mui/icons-material/Check'
import CollectionsIcon from '@mui/icons-material/Collections'
import { getStudentProfile } from '../../api/apiFunctions'

export interface StudentImageEntry {
  enrollment_no: string
  image: string
}

interface BrowseImageModalProps {
  open: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
}

async function fetchStudentImages(): Promise<StudentImageEntry[]> {
  const res = await getStudentProfile()
  if (!res.success || !res.data) return []

  const responseData = res.data as { data: { enrollmentNumber: string; profilePhoto?: string }[] }

  return responseData.data
    .filter(s => s.profilePhoto)
    .map(s => ({
      enrollment_no: s.enrollmentNumber,
      image: s.profilePhoto!,
    }))
}

export default function BrowseImageModal({ open, onClose, onSelect }: BrowseImageModalProps) {
  const [allImages, setAllImages] = useState<StudentImageEntry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSearch('')
    setSelectedUrl(null)
    setError(null)
    setLoading(true)
    fetchStudentImages()
      .then(setAllImages)
      .catch(() => setError('Failed to load images. Please try again.'))
      .finally(() => setLoading(false))
  }, [open])

  const filtered = search.trim()
    ? allImages.filter(s =>
      s.enrollment_no.toLowerCase().includes(search.trim().toLowerCase())
    )
    : allImages

  const handleConfirm = () => {
    if (!selectedUrl) return
    onSelect(selectedUrl)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
    >
      {/* ── Header ── */}
      <Box sx={{
        px: 3, py: 2,
        borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <CollectionsIcon sx={{ color: '#c47a3a', fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
              Browse Student Images
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Search by enrollment number and click to select
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{
          bgcolor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px',
        }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* ── Search ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by enrollment number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
            ...(search && {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
      </Box>

      {/* ── Result count / error ── */}
      <Box sx={{ px: 3, pb: 1 }}>
        {error ? (
          <Typography variant="caption" color="error">{error}</Typography>
        ) : !loading ? (
          <Typography variant="caption" color="text.secondary">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
            {allImages.length !== filtered.length && ` (${allImages.length} total)`}
          </Typography>
        ) : null}
      </Box>

      {/* ── Image grid ── */}
      <Box sx={{ px: 3, pb: 2, maxHeight: 380, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} sx={{ color: '#c47a3a' }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="error" fontSize="0.9rem">{error}</Typography>
            <Button
              size="small"
              sx={{ mt: 1.5, color: '#c47a3a' }}
              onClick={() => {
                setError(null)
                setLoading(true)
                fetchStudentImages()
                  .then(setAllImages)
                  .catch(() => setError('Failed to load images.'))
                  .finally(() => setLoading(false))
              }}
            >
              Retry
            </Button>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary" fontSize="0.9rem">
              {allImages.length === 0
                ? 'No students with photos found'
                : `No student found for "${search}"`}
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 1.5,
          }}>
            {filtered.map(entry => {
              const isSelected = selectedUrl === entry.image
              return (
                <Box
                  key={entry.enrollment_no}
                  onClick={() => setSelectedUrl(isSelected ? null : entry.image)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: isSelected ? '2.5px solid #c47a3a' : '2.5px solid transparent',
                    outline: isSelected ? '3px solid rgba(196,122,58,0.15)' : 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': { border: '2.5px solid rgba(196,122,58,0.5)' },
                  }}
                >
                  <Box
                    component="img"
                    src={entry.image}
                    alt={entry.enrollment_no}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = 'https://via.placeholder.com/100?text=No+Img'
                    }}
                    sx={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                  />
                  <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
                    px: 0.8, py: 0.6,
                  }}>
                    <Typography sx={{
                      color: '#fff', fontSize: 10, fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {entry.enrollment_no}
                    </Typography>
                  </Box>
                  {isSelected && (
                    <Box sx={{
                      position: 'absolute', top: 6, right: 6,
                      width: 20, height: 20, borderRadius: '50%',
                      bgcolor: '#c47a3a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckIcon sx={{ fontSize: 13, color: '#fff' }} />
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{
        px: 3, py: 2,
        borderTop: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography variant="caption" color="text.secondary">
          {selectedUrl ? '1 image selected' : 'No image selected'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={onClose}
            sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button
            variant="contained" size="small"
            disabled={!selectedUrl}
            onClick={handleConfirm}
            sx={{
              borderRadius: '8px', bgcolor: '#c47a3a',
              '&:hover': { bgcolor: '#a8652f' },
              '&:disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' },
            }}
          >
            Use This Image
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}