import { useEffect, useState } from 'react';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { getUsers } from '../../services/api';

export default function UsersPage(){
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);

  useEffect(()=>{
    getUsers().then((r:any)=> setData(r || []));
  },[]);

  const columns = [
    {key: 'id', label: 'ID'},
    {key: 'username', label: 'Username'},
    {key: 'email', label: 'Email'},
    {key: 'is_superuser', label: 'Superuser'},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <button onClick={()=>setOpen(true)} className="bg-primary text-white px-3 py-2 rounded">New User</button>
      </div>

      <Table columns={columns} data={data} />

      <Modal open={open} onClose={()=>setOpen(false)} title={edit? 'Edit User' : 'New User'}>
        <div>
          <p className="text-sm text-gray-500">This modal is a placeholder for create/edit form.</p>
        </div>
      </Modal>
    </div>
  );
}
