import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Shield, ShoppingBag, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

type Tab = 'profile' | 'addresses' | 'orders' | 'security';

export default function CustomerDashboard() {
  const { user, logout, checkSession } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState(user?.gender || '');

  // Address fields
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', mobile: '', house: '', street: '', city: '', state: '', zip: '', country: 'US'
  });

  // Orders
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setDob(user.dob || '');
      setGender(user.gender || '');
      fetchAddresses();
      fetchOrders();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (data) setAddresses(data);
  };

  const fetchOrders = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, total_amount, status, payment_status, created_at,
        order_items (
          id, quantity, price,
          products ( title )
        )
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          dob: dob || null,
          gender: gender || null
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
      checkSession(); // Refresh session
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: newAddress.fullName,
          mobile: newAddress.mobile,
          address_line1: newAddress.house,
          address_line2: newAddress.street,
          city: newAddress.city,
          state: newAddress.state,
          zip_code: newAddress.zip,
          country: newAddress.country,
          is_default: addresses.length === 0 // Default if first address
        });

      if (error) throw error;
      toast.success('Address added successfully!');
      setIsAddingAddress(false);
      setNewAddress({ fullName: '', mobile: '', house: '', street: '', city: '', state: '', zip: '', country: 'US' });
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Address deleted successfully!');
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      // 1. Set all to false
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user!.id);

      // 2. Set chosen to true
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Default address updated!');
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update default address');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-xl text-indigo-600 dark:text-indigo-400">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 dark:text-white truncate">{user?.full_name || 'Customer'}</h2>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'}`}>
                <User className="w-4 h-4" /> Personal Info
              </button>
              <button onClick={() => setActiveTab('addresses')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${activeTab === 'addresses' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'}`}>
                <MapPin className="w-4 h-4" /> Saved Addresses
              </button>
              <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${activeTab === 'orders' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'}`}>
                <ShoppingBag className="w-4 h-4" /> Order History
              </button>
              <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'}`}>
                <Shield className="w-4 h-4" /> Security
              </button>
            </nav>

            <button onClick={logout} className="w-full py-3 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-500/5 transition-all">
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Personal Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
                      <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 bg-gray-100 dark:bg-gray-950 text-sm text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date of Birth</label>
                      <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-sm">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                  <button onClick={() => setIsAddingAddress(!isAddingAddress)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                <AnimatePresence>
                  {isAddingAddress && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 overflow-hidden">
                      <h3 className="font-bold text-sm">New Address Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-900" required />
                        <input type="tel" placeholder="Mobile Number" value={newAddress.mobile} onChange={e => setNewAddress({...newAddress, mobile: e.target.value})} className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-900" required />
                        <input type="text" placeholder="House / Flat No." value={newAddress.house} onChange={e => setNewAddress({...newAddress, house: e.target.value})} className="col-span-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-900" required />
                        <input type="text" placeholder="Street / Area" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="col-span-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-900" required />
                        <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-900" required />
                        <input type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-900" required />
                        <input type="text" placeholder="Zipcode" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-900" required />
                        <input type="text" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-900" required />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Save Address</button>
                        <button type="button" onClick={() => setIsAddingAddress(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-xs font-bold">Cancel</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className={`border rounded-2xl p-5 relative flex flex-col ${addr.is_default ? 'border-indigo-500 bg-indigo-50/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
                      {addr.is_default && (
                        <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Default
                        </span>
                      )}
                      <h4 className="font-bold text-sm mb-1">{addr.full_name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{addr.mobile}</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                        {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}{addr.city}, {addr.state} - {addr.zip_code}
                      </p>
                      <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-indigo-600 font-bold hover:underline">
                            Set as Default
                          </button>
                        )}
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 font-bold hover:underline flex items-center gap-1 ml-auto">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order History</h2>
                {orders.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">
                    You haven't placed any orders yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl p-5 bg-white dark:bg-gray-900 space-y-4">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-white">Order ID:</span> {order.id.slice(0, 8)}
                          </div>
                          <div>
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            {order.order_items.map((item: any, idx: number) => (
                              <p key={idx} className="text-sm font-semibold">{item.products?.title} <span className="text-gray-400 font-normal">x{item.quantity}</span></p>
                            ))}
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-lg">₹{order.total_amount}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security & Connected Accounts</h2>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 space-y-4">
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Login Provider</h4>
                      <p className="text-xs text-gray-500">How you connect to Aura</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold rounded-lg uppercase">
                      Google OAuth
                    </span>
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Profile Security</h4>
                      <p className="text-xs text-gray-500">Escrow and secure purchase options enabled</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-xs font-bold rounded-lg uppercase">
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
