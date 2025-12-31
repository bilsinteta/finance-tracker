import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { cn } from '../lib/utils';

const TransactionModal = ({ isOpen, onClose, onSubmit, transaction, categories }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (transaction) {
      let dateValue = new Date().toISOString().split('T')[0];
      try {
        if (transaction.Date || transaction.date) {
          const d = new Date(transaction.Date || transaction.date);
          if (!isNaN(d.getTime())) {
            dateValue = d.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        console.error("Invalid date:", e);
      }

      setFormData({
        category_id: transaction.CategoryID || transaction.category_id,
        amount: transaction.Amount || transaction.amount,
        description: transaction.Description || transaction.description || '',
        date: dateValue,
      });
    } else {
      setFormData({
        category_id: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.category_id || !formData.amount || !formData.date) {
      alert("Mohon lengkapi semua kolom");
      return;
    }

    onSubmit({
      ...formData,
      category_id: Number(formData.category_id),
      amount: Number(formData.amount),
    });
  };

  if (!isOpen) return null;

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white">
          <h2 className="text-lg font-bold text-slate-800">
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Kategori
            </label>
            <Select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900"
              required
            >
              <option value="">Pilih Kategori</option>
              {safeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
                </option>
              ))}
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Jumlah (Rp)
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              min="0"
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900 font-medium placeholder:text-slate-400"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Tanggal
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900 w-full"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Deskripsi (Opsional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              placeholder="Catatan..."
            />
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            >
              {transaction ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;