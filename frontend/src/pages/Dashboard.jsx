import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import BalanceCard from '../components/BalanceCard';
import TransactionModal from '../components/TransactionModal';
import ExpenseChart from '../components/ExpenseChart';
import TransactionTable from '../components/TransactionTable';
import TransactionFilters from '../components/TransactionFilters';
import { transactionService } from '../api/transactionService';
import { categoryService } from '../api/categoryService';
import { FiPlus, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    category_id: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const txResponse = await transactionService.getAll(filters);

      const txData = txResponse.data || [];
      const meta = txResponse.meta || { page: 1, last_page: 1, total: 0 };

      const [catData, balData] = await Promise.all([
        categoryService.getAll(),
        transactionService.getBalance(),
      ]);

      const validTransactions = (txData || []).filter(tx =>
        tx.category &&
        tx.amount > 0 &&
        new Date(tx.date).toString() !== 'Invalid Date'
      );

      setTransactions(validTransactions);
      setPagination({
        currentPage: meta.page,
        totalPages: meta.last_page,
        totalItems: meta.total,
      });
      setCategories(catData);
      setBalance(balData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data);
      } else {
        await transactionService.create(data);
      }
      setModalOpen(false);
      setEditingTransaction(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Operasi gagal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      try {
        await transactionService.delete(id);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus transaksi');
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(tx => ({
      Tanggal: new Date(tx.date).toLocaleDateString('id-ID'),
      Kategori: tx.category?.name || 'Uncategorized',
      Deskripsi: tx.description,
      Jumlah: tx.amount,
      Tipe: tx.category?.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
    XLSX.writeFile(wb, "laporan_keuangan.xlsx");
  };

  if (loading && !transactions.length && filters.page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-xl font-semibold flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="sm:ml-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Header Bar - Blue */}
        <header className="bg-blue-500 text-white shadow-md h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="sm:hidden p-1 rounded hover:bg-white/20" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold tracking-wide">
              Halo, {user?.name ? user.name.split(' ')[0] : 'Selamat Datang'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Tambah Transaksi" onClick={() => { setEditingTransaction(null); setModalOpen(true); }}>
              <FiPlus className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Top Row: Balance & Charts */}
          {/* Top Row: Balance & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Card - Compact */}
            <div className="lg:col-span-1 h-full">
              <BalanceCard balance={balance} />
            </div>
            {/* Charts - Compact (Two side-by-side inside ExpenseChart) */}
            <div className="lg:col-span-2 h-full">
              <ExpenseChart transactions={transactions} />
            </div>
          </div>

          {/* Filters */}
          <TransactionFilters
            filters={filters}
            setFilters={setFilters}
            categories={categories}
          />

          {/* Table */}
          <TransactionTable
            transactions={transactions}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={(tx) => { setEditingTransaction(tx); setModalOpen(true); }}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleCreateOrUpdate}
        transaction={editingTransaction}
        categories={categories}
      />
    </div>
  );
};

export default Dashboard;