import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Login(){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();

  const submit = async (e:any) => {
    e.preventDefault();
    try{
      const data = new URLSearchParams();
      data.append('username', username);
      data.append('password', password);
      const resp = await axios.post((process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:8000') + '/api/auth/token', data, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
      localStorage.setItem('token', resp.data.access_token);
      router.push('/');
    }catch(e){
      alert('Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={submit} className="space-y-4">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full border p-2 rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border p-2 rounded" />
        <div className="flex items-center justify-between">
          <button className="bg-primary text-white px-4 py-2 rounded">Sign in</button>
          <a href="/register" className="text-sm text-gray-500">Register</a>
        </div>
      </form>
    </div>
  );
}
