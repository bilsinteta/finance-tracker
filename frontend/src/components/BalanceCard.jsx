import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

const BalanceCard = ({ balance }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Income */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Total Pemasukan</h3>
          <FiTrendingUp className="text-3xl" />
        </div>
        <p className="text-3xl font-bold">
          {formatCurrency(balance?.total_income || 0)}
        </p>
      </div>

      {/* Total Expense */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Total Pengeluaran</h3>
          <FiTrendingDown className="text-3xl" />
        </div>
        <p className="text-3xl font-bold">
          {formatCurrency(balance?.total_expense || 0)}
        </p>
      </div>

      {/* Balance */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Saldo</h3>
          <FiDollarSign className="text-3xl" />
        </div>
        <p className="text-3xl font-bold">
          {formatCurrency(balance?.balance || 0)}
        </p>
      </div>
    </div>
  );
};

export default BalanceCard;