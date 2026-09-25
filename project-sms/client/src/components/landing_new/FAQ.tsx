import { useState } from 'react'
import {
  Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export default function FAQ({ data }: { data?: { q: string; a: string; id?: string }[] }) {
  const [expanded, setExpanded] = useState<string | false>(false)

  const displayFaqs = data && data.length > 0
    ? data.map((f, index) => ({ ...f, id: f.id || `faq-${index}` })) : []

  return (
    <Box id="faq" sx={{ py: { xs: 9, md: 14 }, bgcolor: '#fff' }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 10 }, px: { xs: 1, sm: 2 } }}>
          <Typography sx={{
            display: 'inline-block',
            bgcolor: 'rgba(10,37,64,0.05)', color: '#0a2540',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            px: 2, py: 0.6, borderRadius: '20px', mb: 2,
            border: '1px solid rgba(10,37,64,0.1)',
          }}>
            FAQ
          </Typography>
          <Typography variant="h2" sx={{
            color: '#04301a', mb: 2,
            fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3rem' },
            lineHeight: 1.1, letterSpacing: '-0.03em',
          }}>
            Frequently Asked Questions
          </Typography>
          <Typography sx={{
            color: '#6b7280', maxWidth: 460, mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.7, fontFamily: '"DM Sans", sans-serif',
          }}>
            Everything you need to know about our courses and services
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {displayFaqs.map((item: { q: string; a: string; id: string }) => (
            <Accordion
              key={item.id}
              expanded={expanded === item.id}
              onChange={() => setExpanded(expanded === item.id ? false : item.id)}
              elevation={0}
              disableGutters
              sx={{
                border: '1.5px solid',
                borderColor: expanded === item.id ? 'rgba(196,122,58,0.3)' : 'rgba(10,37,64,0.07)',
                borderRadius: '16px !important',
                overflow: 'hidden',
                '&:before': { display: 'none' },
                transition: 'all 0.25s ease',
                boxShadow: expanded === item.id ? '0 8px 24px rgba(196,122,58,0.08)' : 'none',
              }}
            >
              <AccordionSummary
                expandIcon={
                  <Box sx={{
                    width: 28, height: 28,
                    bgcolor: expanded === item.id ? '#c47a3a' : 'rgba(10,37,64,0.06)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.25s ease',
                    flexShrink: 0,
                  }}>
                    {expanded === item.id
                      ? <RemoveIcon sx={{ fontSize: 15, color: '#fff' }} />
                      : <AddIcon sx={{ fontSize: 15, color: '#374151' }} />}
                  </Box>
                }
                sx={{
                  bgcolor: expanded === item.id ? 'rgba(253,249,245,0.8)' : '#fff',
                  '&:hover': { bgcolor: 'rgba(253,249,245,0.6)' },
                  px: 3, py: 0.8,
                  transition: 'background 0.25s ease',
                  '& .MuiAccordionSummary-expandIconWrapper': { transform: 'none !important' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, pr: 1.5 }}>
                  <Typography sx={{
                    fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
                    color: '#0d1b2a', fontSize: { xs: '0.92rem', md: '0.98rem' },
                    lineHeight: 1.5,
                  }}>
                    {item.q}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{
                bgcolor: 'rgba(253,249,245,0.5)',
                px: 3, pb: 3, pt: 0,
                borderTop: '1px solid rgba(196,122,58,0.1)',
              }}>
                <Typography sx={{
                  color: '#6b7280', lineHeight: 1.75,
                  fontSize: { xs: '0.88rem', md: '0.93rem' },
                  fontFamily: '"DM Sans", sans-serif',
                }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  )
}