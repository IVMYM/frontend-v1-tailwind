import Card from '../components/Card';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard(){
  const [stats, setStats] = useState({ users: 0, db: 0, tasks: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(()=>{
    getDashboardStats().then((d:any)=> setStats(d));
    // mock chart data
    setChartData([
      { name: 'Mon', tasks: 4 },
      { name: 'Tue', tasks: 6 },
      { name: 'Wed', tasks: 5 },
      { name: 'Thu', tasks: 8 },
      { name: 'Fri', tasks: 6 },
    ]);
  },[]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Users" value={stats.users} />
        <Card title="DB Connections" value={stats.db} />
        <Card title="Inspection Tasks" value={stats.tasks} />
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-medium mb-3">Recent Tasks</h3>
        <div style={{height:240}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
