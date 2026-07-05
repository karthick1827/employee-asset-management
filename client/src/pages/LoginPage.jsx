import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Boxes } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Card, ErrorText, Field, Input } from '../components/ui'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Boxes size={22} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Employee Asset Management</h1>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
