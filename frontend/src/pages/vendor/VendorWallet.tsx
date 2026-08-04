import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Wallet, ArrowUpRight, Clock, Building2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function VendorWallet() {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({ account_holder_name: '', account_number: '', ifsc: '', bank_name: '' });

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch wallet
      const walletRes = await fetch(`${import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api'}/wallet`, { headers });
      if (walletRes.ok) setWallet(await walletRes.json());

      // Fetch history
      const historyRes = await fetch(`${import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api'}/wallet/history`, { headers });
      if (historyRes.ok) setHistory(await historyRes.json());

      // Fetch withdrawals
      const withdrawRes = await fetch(`${import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api'}/withdrawals`, { headers });
      if (withdrawRes.ok) setWithdrawals(await withdrawRes.json());

      // Fetch banks
      const bankRes = await fetch(`${import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api'}/withdrawals/banks`, { headers });
      if (bankRes.ok) setBankAccounts(await bankRes.json());

    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !selectedBank) return toast.error('Please enter amount and select bank');
    if (Number(withdrawAmount) > (wallet?.available_balance || 0)) return toast.error('Insufficient available balance');

    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api'}/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`
        },
        body: JSON.stringify({ amount: Number(withdrawAmount), bankAccountId: selectedBank })
      });

      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success('Withdrawal requested successfully');
      setWithdrawAmount('');
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api'}/withdrawals/banks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`
        },
        body: JSON.stringify(newBank)
      });

      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success('Bank account added');
      setShowAddBank(false);
      setNewBank({ account_holder_name: '', account_number: '', ifsc: '', bank_name: '' });
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Wallet & Earnings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Wallet className="w-5 h-5" />
            <h3 className="font-semibold">Available Balance</h3>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">₹{Number(wallet?.available_balance || 0).toFixed(2)}</p>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2 text-orange-600">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Pending Withdrawal</h3>
          </div>
          <p className="text-4xl font-extrabold text-orange-900">₹{Number(wallet?.pending_balance || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ArrowUpRight className="w-5 h-5" /> Request Withdrawal</h2>
          
          {bankAccounts.length === 0 ? (
            <div className="text-center py-6">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No bank accounts added yet.</p>
              <button onClick={() => setShowAddBank(true)} className="px-4 py-2 bg-black text-white rounded-lg">Add Bank Account</button>
            </div>
          ) : (
            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw</label>
                <input type="number" min="100" max={wallet?.available_balance || 0} required value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-black focus:border-black" placeholder="Enter amount (Min ₹100)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank Account</label>
                <select required value={selectedBank} onChange={e => setSelectedBank(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-black focus:border-black">
                  <option value="">Select Account</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.bank_name} - {b.account_number.slice(-4)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between mt-6">
                <button type="button" onClick={() => setShowAddBank(true)} className="text-sm text-indigo-600 font-medium">Add another bank</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">Request Withdrawal</button>
              </div>
            </form>
          )}

          {/* Add Bank Form Modal-like inline */}
          {showAddBank && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-bold mb-4">Add Bank Account</h3>
              <form onSubmit={handleAddBank} className="space-y-3">
                <input type="text" required placeholder="Account Holder Name" value={newBank.account_holder_name} onChange={e => setNewBank({...newBank, account_holder_name: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                <input type="text" required placeholder="Bank Name" value={newBank.bank_name} onChange={e => setNewBank({...newBank, bank_name: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                <input type="text" required placeholder="Account Number" value={newBank.account_number} onChange={e => setNewBank({...newBank, account_number: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                <input type="text" required placeholder="IFSC Code" value={newBank.ifsc} onChange={e => setNewBank({...newBank, ifsc: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddBank(false)} className="flex-1 py-2 bg-gray-200 text-gray-800 rounded font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-black text-white rounded font-medium">Save Bank</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Withdrawal Requests</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {withdrawals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No withdrawals requested yet.</p>
            ) : (
              withdrawals.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div>
                    <p className="font-bold">₹{Number(req.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(req.requested_at).toLocaleDateString()} • {req.vendor_bank_accounts?.bank_name}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    req.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {req.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Wallet Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right">Gross Amount</th>
                <th className="pb-3 font-medium text-right">Commission</th>
                <th className="pb-3 font-medium text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map(tx => (
                <tr key={tx.id}>
                  <td className="py-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${tx.transaction_type === 'Order Credit' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="py-4 text-right">₹{Number(tx.gross_amount).toFixed(2)}</td>
                  <td className="py-4 text-right text-red-500">-₹{Number(tx.commission).toFixed(2)}</td>
                  <td className="py-4 text-right font-bold text-gray-900">
                    {tx.transaction_type === 'Order Credit' ? '+' : '-'}₹{Number(tx.net_amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
