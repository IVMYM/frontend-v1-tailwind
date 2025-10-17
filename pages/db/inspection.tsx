import { useEffect, useState } from 'react';
import { dbInspect } from '../../services/api';
import Table from '../../components/Table';

export default function DBInspection(){
  const [q, setQ] = useState('');
  const [res, setRes] = useState<any[]>([]);

  const run = async ()=>{
    const r = await dbInspect(q);
    // expect r to be array or object; normalize
    if(Array.isArray(r)) setRes(r);
    else if(r && r.rows) setRes(r.rows);
    else setRes([r]);
  };

  useEffect(()=>{ run(); },[]);

  const cols = res.length ? Object.keys(res[0]).map(k=>({key:k,label:k})) : [{key:'',label:'No Data'}];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Database Inspection</h1>
        <div className="flex items-center space-x-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="query" className="border p-2 rounded" />
          <button onClick={run} className="bg-primary text-white px-3 py-2 rounded">Run</button>
        </div>
      </div>
      <Table columns={cols} data={res} />
    </div>
  );
}
