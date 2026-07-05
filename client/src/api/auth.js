import client from './client'

export function login(email, password) {
  return client.post('/auth/login', { email, password }).then((res) => res.data.data)
}

export function register(payload) {
  return client.post('/auth/register', payload).then((res) => res.data.data)
}

export function me() {
  return client.get('/auth/me').then((res) => res.data.data)
}
