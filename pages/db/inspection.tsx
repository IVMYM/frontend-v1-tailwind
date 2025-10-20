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

// 检查 res 数组是否非空 并且 res 的第一个元素是否为一个有效的对象
const cols = (res.length > 0 && res[0] && typeof res[0] === 'object')   ? Object.keys(res[0]).map(k => ({key: k, label: k}))   : [{key: '', label: '没有返回数据'}];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">磐维数据库巡检</h1>
        <div className="flex items-center space-x-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="查询" className="border p-2 rounded" />
          <button onClick={run} className="bg-primary text-white px-3 py-2 rounded">运行</button>
        </div>
      </div>
      <Table columns={cols} data={res} />
    </div>
  );
}
