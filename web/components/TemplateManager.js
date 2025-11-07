import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Chip,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import axios from 'axios'

export default function TemplateManager({ open, onClose, onLoadTemplate, token }) {
  const [templates, setTemplates] = useState([])
  const [templateName, setTemplateName] = useState('')
  const [templateSubject, setTemplateSubject] = useState('')
  const [templateBody, setTemplateBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  const loadTemplates = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('http://localhost:5000/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.data.success) {
        setTemplates(res.data.templates)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async () => {
    if (!templateName || !templateSubject) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await axios.post(
        'http://localhost:5000/templates',
        {
          name: templateName,
          subject: templateSubject,
          body: templateBody,
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (res.data.success) {
        setSuccess('Template saved successfully!')
        setTemplateName('')
        setTemplateSubject('')
        setTemplateBody('')
        loadTemplates()
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await axios.delete(`http://localhost:5000/templates/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      loadTemplates()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete template')
    }
  }

  const loadTemplate = (template) => {
    onLoadTemplate(template)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Email Templates
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Save New Template
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Subject"
            value={templateSubject}
            onChange={(e) => setTemplateSubject(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            size="small"
            label="Body"
            value={templateBody}
            onChange={(e) => setTemplateBody(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Use variables like: {`{{name}}, {{company}}, {{position}}`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveTemplate}
            disabled={!templateName || !templateSubject}
          >
            Save Template
          </Button>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Saved Templates
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {templates.length === 0 ? (
              <ListItem>
                <ListItemText secondary="No templates saved yet" />
              </ListItem>
            ) : (
              templates.map((template) => (
                <ListItem
                  key={template.id}
                  button
                  onClick={() => loadTemplate(template)}
                  sx={{ border: '1px solid #eee', borderRadius: 1, mb: 1 }}
                >
                  <ListItemText
                    primary={template.name}
                    secondary={template.subject}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTemplate(template.id)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
