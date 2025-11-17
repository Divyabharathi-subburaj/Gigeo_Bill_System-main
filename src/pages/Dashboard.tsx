import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, IndianRupee, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user, profile } = useAuthStore();
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [totalBills, setTotalBills] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch recent bills
      const { data: bills } = await supabase
        .from('bills')
        .select(`
          id,
          invoice_number,
          total,
          created_at,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentBills(bills || []);

      // Fetch total bills count
      const { count } = await supabase
        .from('bills')
        .select('*', { count: 'exact', head: true });

      setTotalBills(count || 0);

      // Fetch total revenue
      const { data: revenue } = await supabase
        .from('bills')
        .select('total')
        .gt('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

      const total = (revenue || []).reduce((sum, bill) => sum + bill.total, 0);
      setTotalRevenue(total);

      // Fetch monthly revenue for chart
      const { data: monthly } = await supabase
        .from('bills')
        .select('total, created_at')
        .gt('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

      const monthlyData = Array(12).fill(0);
      (monthly || []).forEach((bill) => {
        const month = new Date(bill.created_at).getMonth();
        monthlyData[month] += bill.total;
      });
      setMonthlyRevenue(monthlyData);
    };

    fetchDashboardData();
  }, []);

  const chartData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlyRevenue,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Revenue',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-emerald-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">
              GIGEO Enterprises
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {profile?.full_name || user?.email}</span>
            <Link
              to="/profile"
              className="text-sm text-emerald-600 hover:text-emerald-500"
            >
              Profile
            </Link>
          </div>
        </div>
      </header> */}

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Left Section: Logo and Title */}
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-emerald-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">
              GIGEO Enterprises
            </h1>
          </div>

          {/* Right Section: Navigation Links and Profile */}
          <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            {/* <Link
              to="/"
              className="text-sm text-gray-700 hover:text-gray-500"
            >
              Dashboard
            </Link> */}
            <Link
              to="/"
              className="text-sm text-gray-700 hover:text-gray-500"
            >
              Bills
            </Link>

            {/* Welcome and Profile Section */}
            <span className="text-gray-700">Welcome, {profile?.full_name || user?.email}</span>
            <Link
              to="/profile"
              className="text-sm text-emerald-600 hover:text-emerald-500"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>


      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bills</p>
                <p className="text-2xl font-semibold text-gray-900">{totalBills}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100">
                <IndianRupee className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <Bar options={chartOptions} data={chartData} />
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Bills</h2>
            <Link
              to="/bills/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Bill
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      <Link to={`/bills/${bill.id}`}>
                        #{bill.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(bill.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.customers.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ₹ {bill.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}