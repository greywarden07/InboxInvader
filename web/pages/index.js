import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Slider,
  Switch,
  FormControlLabel,
  AppBar,
  Toolbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material'
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DownloadForOffline as DownloadIcon,
  FolderOpen as TemplateIcon,
  Visibility as PreviewIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'
import TemplateManager from '../components/TemplateManager'
import EmailPreview from '../components/EmailPreview'

// API URL configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function Home() {
  // Auth state
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState('')
  const [showSignup, setShowSignup] = useState(false)

  // Theme state
  const [darkMode, setDarkMode] = useState(false)

  // Form state
  const [smtpServer, setSmtpServer] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState(587)
  const [senderEmail, setSenderEmail] = useState('')
  const [senderPassword, setSenderPassword] = useState('')
  const [recipients, setRecipients] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState([])
  const [delaySeconds, setDelaySeconds] = useState(2)
  
  // Variable substitution
  const [variables, setVariables] = useState({})
  const [showVariables, setShowVariables] = useState(false)
  
  // UI state
  const [results, setResults] = useState(null)
  const [sending, setSending] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Load auth and theme from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUsername = localStorage.getItem('username')
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    
    if (savedToken) {
      setToken(savedToken)
      setUsername(savedUsername || '')
    }
    setDarkMode(savedDarkMode)
  }, [])

  // Create theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#667eea',
          },
          secondary: {
            main: '#764ba2',
          },
        },
      }),
    [darkMode]
  )

  const handleLoginSuccess = (newToken) => {
    setToken(newToken)
    const savedUsername = localStorage.getItem('username')
    setUsername(savedUsername || '')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername('')
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode.toString())
  }

  const onFiles = (e) => {
    setAttachments(Array.from(e.target.files))
  }

  const handlePreview = () => {
    setPreviewOpen(true)
  }

  const handleSendConfirmed = async () => {
    setPreviewOpen(false)
    await handleSend()
  }

  const handleSend = async () => {
    setSending(true)
    setResults(null)

    const fd = new FormData()
    fd.append('smtp_server', smtpServer)
    fd.append('smtp_port', smtpPort)
    fd.append('sender_email', senderEmail)
    fd.append('sender_password', senderPassword)
    fd.append('recipients', recipients)
    fd.append('subject', subject)
    fd.append('body', body)
    fd.append('delay_seconds', delaySeconds)
    fd.append('variables', JSON.stringify(variables))
    attachments.forEach((f) => fd.append('attachments', f))

    try {
      const res = await axios.post(`${API_URL}/send`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 300000,
      })
      setResults(res.data)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Unknown error'
      const trace = err?.response?.data?.trace || ''
      setResults({
        success: false,
        message: msg,
        trace,
        results: [],
      })
    } finally {
      setSending(false)
    }
  }

  const handleExportCSV = async () => {
    if (!results || !results.results) return

    try {
      const res = await axios.post(
        `${API_URL}/export-csv`,
        { results: results.results },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      )

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `email_results_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to export CSV: ' + (err?.response?.data?.message || err.message))
    }
  }

  const handleReset = () => {
    setSubject('')
    setBody('')
    setAttachments([])
    setVariables({})
    setResults(null)
  }

  const handleLoadTemplate = (template) => {
    setSubject(template.subject)
    setBody(template.body)
  }

  const addVariable = () => {
    const key = prompt('Variable name (e.g., name, company):')
    if (key) {
      const value = prompt(`Value for {{${key}}}:`)
      if (value !== null) {
        setVariables({ ...variables, [key]: value })
      }
    }
  }

  if (!token) {
    if (showSignup) {
      return (
        <SignupForm
          onSignupSuccess={() => setShowSignup(false)}
          onSwitchToLogin={() => setShowSignup(false)}
        />
      )
    }
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: darkMode
            ? 'linear-gradient(135deg, #434343 0%, #000000 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
              Welcome, {username}
            </Typography>
            <Tooltip title="Toggle Dark Mode">
              <IconButton onClick={toggleDarkMode} sx={{ color: 'white' }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ color: 'white' }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Card elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                📧 InboxInvader
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Advanced email sender with templates, variables, and detailed tracking
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<TemplateIcon />}
                  onClick={() => setTemplateOpen(true)}
                >
                  Templates
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setShowVariables(!showVariables)}
                >
                  Variables ({Object.keys(variables).length})
                </Button>
              </Box>

              <Collapse in={showVariables}>
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Variable Substitution
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    Use {`{{variableName}}`} in subject/body. Example: {`{{name}}, {{company}}`}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {Object.entries(variables).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        onDelete={() => {
                          const newVars = { ...variables }
                          delete newVars[key]
                          setVariables(newVars)
                        }}
                        size="small"
                      />
                    ))}
                  </Box>
                  <Button size="small" onClick={addVariable}>
                    + Add Variable
                  </Button>
                </Paper>
              </Collapse>

              <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }}>
                {/* Advanced SMTP Settings */}
                <Box sx={{ mb: 3 }}>
                  <Button
                    size="small"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  >
                    Advanced SMTP Settings
                  </Button>
                  <Collapse in={showAdvanced}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          label="SMTP Server"
                          value={smtpServer}
                          onChange={(e) => setSmtpServer(e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="SMTP Port"
                          type="number"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(Number(e.target.value))}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Collapse>
                </Box>

                {/* Sender Credentials */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Sender Email"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      disabled={sending}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="App Password / SMTP Password"
                      type="password"
                      value={senderPassword}
                      onChange={(e) => setSenderPassword(e.target.value)}
                      disabled={sending}
                      helperText="Use Gmail App Password (not your login password)"
                    />
                  </Grid>

                  {/* Recipients */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={3}
                      label="Recipients"
                      placeholder="Enter emails separated by comma, semicolon or newline"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      disabled={sending}
                    />
                  </Grid>

                  {/* Subject */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={sending}
                      helperText="Use {{variables}} for substitution"
                    />
                  </Grid>

                  {/* Body */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      label="Body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      disabled={sending}
                      helperText="Use {{variables}} for substitution"
                    />
                  </Grid>

                  {/* Delay Control */}
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Delay between emails: {delaySeconds}s
                    </Typography>
                    <Slider
                      value={delaySeconds}
                      onChange={(e, val) => setDelaySeconds(val)}
                      min={0}
                      max={10}
                      step={0.5}
                      marks
                      valueLabelDisplay="auto"
                      disabled={sending}
                    />
                  </Grid>

                  {/* Attachments */}
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AttachFileIcon />}
                      disabled={sending}
                    >
                      Attach Files
                      <input type="file" hidden multiple onChange={onFiles} />
                    </Button>
                    {attachments.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {attachments.map((f, i) => (
                          <Chip
                            key={i}
                            label={f.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<PreviewIcon />}
                    disabled={sending}
                    sx={{
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      px: 4,
                    }}
                  >
                    Preview & Send
                  </Button>
                  <Button variant="outlined" onClick={handleReset} disabled={sending}>
                    Reset
                  </Button>
                </Box>

                {sending && (
                  <Box sx={{ mt: 3 }}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Sending emails... Please wait.
                    </Typography>
                  </Box>
                )}
              </form>

              {/* Results */}
              {results && (
                <Box sx={{ mt: 4 }}>
                  <Alert
                    severity={results.success ? 'success' : 'error'}
                    icon={results.success ? <CheckCircleIcon /> : <ErrorIcon />}
                    sx={{ mb: 2 }}
                    action={
                      results.results && results.results.length > 0 && (
                        <Button
                          color="inherit"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={handleExportCSV}
                        >
                          Export CSV
                        </Button>
                      )
                    }
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {results.message}
                    </Typography>
                    {results.summary && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Total: {results.summary.total} | Successful: {results.summary.successful} |
                        Failed: {results.summary.failed}
                      </Typography>
                    )}
                  </Alert>

                  {results.results && results.results.length > 0 && (
                    <TableContainer component={Paper} elevation={2}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell>
                              <strong>Email</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Status</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Message</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Time</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {results.results.map((r, i) => (
                            <TableRow key={i} hover>
                              <TableCell>{r.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={r.success ? 'Sent' : 'Failed'}
                                  color={r.success ? 'success' : 'error'}
                                  size="small"
                                  icon={r.success ? <CheckCircleIcon /> : <ErrorIcon />}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color={r.success ? 'text.secondary' : 'error.main'}
                                >
                                  {r.message}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption">
                                  {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : 'N/A'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {results.trace && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        color="error"
                        component="pre"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {results.trace}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Footer Note */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
              💡 Tip: For Gmail, enable 2FA and create an App Password. Never share credentials.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Dialogs */}
      <TemplateManager
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onLoadTemplate={handleLoadTemplate}
        token={token}
      />

      <EmailPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleSendConfirmed}
        emailData={{ subject, body, recipients, attachments }}
      />
    </ThemeProvider>
  )
}


