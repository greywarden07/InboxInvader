import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material'
import {
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material'

export default function EmailPreview({ open, onClose, onConfirm, emailData }) {
  const { subject, body, recipients, attachments } = emailData || {}

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Email Preview
        <Button
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Recipients
          </Typography>
          <Typography variant="body2">
            {recipients?.split(/[,;\n]/).filter(r => r.trim()).join(', ') || 'N/A'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Subject
          </Typography>
          <Typography variant="h6">{subject || '(No subject)'}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Body
          </Typography>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              bgcolor: 'grey.50',
              p: 2,
              borderRadius: 1,
              mt: 1,
            }}
          >
            {body || '(Empty body)'}
          </Typography>
        </Box>

        {attachments && attachments.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Attachments
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {attachments.map((file, i) => (
                  <Chip key={i} label={file.name} size="small" />
                ))}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Edit
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={<SendIcon />}
          sx={{
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Confirm & Send
        </Button>
      </DialogActions>
    </Dialog>
  )
}
