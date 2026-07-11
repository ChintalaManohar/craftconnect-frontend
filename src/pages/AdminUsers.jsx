import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiUsers,
  FiSearch,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiAlertCircle,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiCalendar,
  FiX
} from 'react-icons/fi';
import { adminUserService } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

function AdminUsers({ user, onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'artisans' ? 'artisans' : 'customers';

  const [users, setUsers] = useState({ customers: [], artisans: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal details state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalType, setUserModalType] = useState(''); // 'customer' or 'artisan'

  useEffect(() => {

    const loadUsers = async () => {

      try {

        setLoading(true);

        const data =
          await adminUserService.getUsers();

        setUsers({
          customers: data.customers,
          artisans: data.artisans
        });

      } catch (error) {

        console.error(
          'Failed to load admin users:',
          error
        );

      } finally {

        setLoading(false);
      }
    };

    loadUsers();

  }, []);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setSearchQuery('');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter logic
  const filteredCustomers = users.customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArtisans = users.artisans.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeactivateUser = async (id) => {
    try {
      await adminUserService.deleteUser(id);

      setUsers(prev => ({
        customers: prev.customers.map(customer =>
          customer.id === id
            ? { ...customer, active: false }
            : customer
        ),

        artisans: prev.artisans.map(artisan =>
          artisan.id === id
            ? { ...artisan, active: false }
            : artisan
        )
      }));

      setSelectedUser(prev =>
        prev?.id === id
          ? { ...prev, active: false }
          : prev
      );

    } catch (error) {
      console.error(
        "Failed to deactivate user:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <AdminNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-2xl flex-shrink-0">
              <FiUsers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">User Management</h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage and audit registered customer and artisan accounts</p>
            </div>
          </div>
        </div>

        {/* Tab Controls and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex bg-white p-1 border border-gray-150 rounded-2xl self-start">
            <button
              onClick={() => handleTabChange('customers')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'customers'
                ? 'bg-accent text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Customers
            </button>
            <button
              onClick={() => handleTabChange('artisans')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'artisans'
                ? 'bg-accent text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Artisans
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FiSearch className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading users list...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
            {activeTab === 'customers' ? (
              /* CUSTOMERS TAB VIEW */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-4">Customer Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Registration Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-semibold">
                          No matching customer accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/10">
                              {getInitials(customer.name)}
                            </div>
                            <span className="font-bold text-accent">{customer.name}</span>
                          </td>
                          <td className="px-6 py-4 font-mono">{customer.email}</td>
                          <td className="px-6 py-4">{customer.phone}</td>
                          <td className="px-6 py-4 text-gray-400">{customer.regDate}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedUser(customer);
                                setUserModalType('customer');
                              }}
                              className="px-4 py-1.5 bg-gray-50 hover:bg-primary hover:text-white border border-gray-200 hover:border-primary text-gray-600 font-bold text-xs rounded-full transition-all cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ARTISANS TAB VIEW */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-4">Artisan Name</th>
                      <th className="px-6 py-4">Village</th>
                      <th className="px-6 py-4">State</th>
                      <th className="px-6 py-4">Craft Specialty</th>
                      <th className="px-6 py-4">Profile Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                    {filteredArtisans.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-semibold">
                          No matching artisan accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredArtisans.map((artisan) => (
                        <tr key={artisan.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-full bg-secondary overflow-hidden border border-gray-150 flex-shrink-0 flex items-center justify-center">
                              {artisan.avatar ? (
                                <img src={artisan.avatar} alt={artisan.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-accent font-black text-xs">
                                  {getInitials(artisan.name)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-accent">{artisan.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{artisan.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">{artisan.village || <span className="text-gray-300">Unset</span>}</td>
                          <td className="px-6 py-4">{artisan.state || <span className="text-gray-300">Unset</span>}</td>
                          <td className="px-6 py-4 font-semibold text-primary">{artisan.category || <span className="text-gray-300">Unset</span>}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${artisan.isComplete
                              ? 'bg-green-50 text-green-600 border border-green-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                              {artisan.isComplete ? 'Complete' : 'Incomplete'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedUser(artisan);
                                setUserModalType('artisan');
                              }}
                              className="px-4 py-1.5 bg-gray-50 hover:bg-primary hover:text-white border border-gray-200 hover:border-primary text-gray-600 font-bold text-xs rounded-full transition-all cursor-pointer"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col">

            {/* Header banner background */}
            <div className="h-28 bg-gradient-to-tr from-accent/80 to-accent relative flex-shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none cursor-pointer bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Content Container */}
            <div className="px-6 pb-8 pt-0 -mt-10 relative z-10 flex-grow">

              {/* Profile Avatar circle */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary overflow-hidden border-4 border-white shadow flex items-center justify-center">
                  {userModalType === 'artisan' && selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-accent text-2xl font-black select-none bg-secondary w-full h-full flex items-center justify-center">
                      {getInitials(selectedUser.name)}
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-accent mt-3 font-sans leading-tight">{selectedUser.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-extrabold uppercase tracking-wider text-primary mt-1.5">
                  {userModalType === 'artisan' ? 'Artisan Partner' : 'Customer Account'}
                </span>
              </div>

              {/* Data Rows */}
              <div className="mt-8 space-y-4 text-xs sm:text-sm">

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center space-x-2">
                    <FiMail className="text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Email Address</span>
                      <p className="font-semibold text-gray-700 truncate">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center space-x-2">
                    <FiPhone className="text-primary flex-shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Phone Number</span>
                      <p className="font-semibold text-gray-700">{selectedUser.phone ? `+91 ${selectedUser.phone}` : 'Unset'}</p>
                    </div>
                  </div>
                </div>

                {userModalType === 'customer' ? (
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center space-x-3">
                    <FiCalendar className="text-primary flex-shrink-0 h-5 w-5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Registration Date</span>
                      <p className="font-bold text-accent">{selectedUser.regDate}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center space-x-2">
                        <FiAward className="text-primary flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Experience</span>
                          <p className="font-semibold text-gray-700">{selectedUser.experience || 'Unset'}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center space-x-2">
                        <FiMapPin className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Location</span>
                          <p className="font-semibold text-gray-700 truncate">
                            {selectedUser.village ? `${selectedUser.village}, ${selectedUser.state}` : 'Unset'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1.5 leading-relaxed">
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider flex items-center">
                        <FiBookOpen className="mr-1 text-primary" /> Story Narrative
                      </span>
                      <h4 className="font-bold text-accent text-xs">
                        {selectedUser.storyTitle ? `"${selectedUser.storyTitle}"` : 'No custom narrative shared yet.'}
                      </h4>
                      {selectedUser.storyDescription && (
                        <p className="text-gray-500 text-xs line-clamp-4 leading-relaxed whitespace-pre-line font-medium mt-1">
                          {selectedUser.storyDescription}
                        </p>
                      )}
                    </div>
                  </>
                )}

              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">

              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${selectedUser.active
                    ? 'bg-green-50 text-green-600 border border-green-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
                    }`}
                >
                  {selectedUser.active ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() => handleDeactivateUser(selectedUser.id)}
                  disabled={!selectedUser.active}
                  className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${selectedUser.active
                    ? 'bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                >
                  {selectedUser.active
                    ? 'Deactivate User'
                    : 'Deactivated'}
                </button>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow transition-all cursor-pointer"
                >
                  Close
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminUsers;
