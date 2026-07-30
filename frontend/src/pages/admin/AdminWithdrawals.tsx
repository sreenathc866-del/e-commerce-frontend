import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from "sonner";
import { Check, X, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminWithdrawals() {
  const { user } = useAuthStore();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
    }
  }, [user]);

  const fetchWithdrawals = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/withdrawals`, {
        headers: { 'Authorization': `Bearer ${session.session?.access_token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      setWithdrawals(await res.json());
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`Withdrawal marked as ${status}`);
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold mb-8">Withdrawal Requests</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Date</th>
              <th className="p-4 font-semibold text-gray-600">Vendor ID</th>
              <th className="p-4 font-semibold text-gray-600">Amount</th>
              <th className="p-4 font-semibold text-gray-600">Bank Details</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {withdrawals.map(req => (
              <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 whitespace-nowrap">{new Date(req.requested_at).toLocaleDateString()}</td>
                <td className="p-4 text-gray-500 font-mono text-xs">{req.vendor_id.slice(0, 8)}...</td>
                <td className="p-4 font-bold text-gray-900">₹{Number(req.amount).toFixed(2)}</td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">{req.vendor_bank_accounts?.account_holder_name}</p>
                  <p className="text-xs text-gray-500">{req.vendor_bank_accounts?.bank_name} - {req.vendor_bank_accounts?.account_number}</p>
                  <p className="text-xs text-gray-500">IFSC: {req.vendor_bank_accounts?.ifsc}</p>
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                    req.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {req.status === 'Pending' && (
                    <>
                      <button onClick={() => updateStatus(req.id, 'Approved')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateStatus(req.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {req.status === 'Approved' && (
                    <button onClick={() => updateStatus(req.id, 'Paid')} className="px-3 py-1.5 bg-green-600 text-white font-medium text-xs rounded-lg hover:bg-green-700 inline-flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No withdrawal requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
