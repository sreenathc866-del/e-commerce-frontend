import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function VendorDashboard() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Vendor Dashboard</h1>
      <p>Manage your shop, products, and orders here.</p>
      <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-black text-white rounded">Logout</button>
    </div>
  );
}
