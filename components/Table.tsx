import React from 'react';

export default function Table({columns, data}:{columns:{key:string,label:string}[], data:any[]}) {
  return (
    <div className="overflow-auto bg-white rounded shadow">
      <table className="min-w-full">
        <thead className="border-b">
          <tr>
            {columns.map(c=> <th key={c.key} className="text-left p-3 text-sm text-gray-600">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx)=>(
            <tr key={idx} className="border-b hover:bg-gray-50">
              {columns.map(c=> <td key={c.key} className="p-3 text-sm">{String(row[c.key] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
