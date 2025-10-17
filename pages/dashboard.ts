import Layout from '@/components/Layout'
import { dbInspect } from '@/services/db'
import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'

export default function Dashboard() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    dbInspect()
      .then((res) => setData(res))
      .catch(() => showToast('加载数据库巡检失败'))
  }, [])

  return (
    <Layout title="数据库巡检">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">数据库连接状态</h2>
        <table className="w-full text-left border border-gray-200 rounded-xl">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">数据库</th>
              <th className="p-3">状态</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3">{item.db_name}</td>
                <td className="p-3">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
