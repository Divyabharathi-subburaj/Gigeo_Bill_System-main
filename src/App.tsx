import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
// import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import BillList from './pages/BillList';
import NewBill from './pages/NewBill';
import BillDetails from './pages/BillDetails';
import Profile from './pages/Profile';
import { Building2 } from 'lucide-react';

function App() {
  const { loadProfile, loading, user } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          {/* <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} /> */}
          <Route path="/" element={user ? <BillList/> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/bills/new" element={user ? <NewBill /> : <Navigate to="/login" />} />
          <Route path="/bills/:id" element={user ? <BillDetails /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
