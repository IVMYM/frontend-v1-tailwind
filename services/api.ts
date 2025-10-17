import axios from 'axios';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export async function getDashboardStats() {
  try {
    const r = await client.get('/dashboard/stats');
    return r.data;
  } catch (e) {
    return { users: 0, db: 0, tasks: 0 };
  }
}

export async function getUsers() {
  const r = await client.get('/api/auth/admin/users');
  return r.data;
}

export async function dbInspect(q='') {
  const r = await client.get('/api/db-inspect/proxy', { params: { q } });
  return r.data;
}
