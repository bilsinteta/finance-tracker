import { FiTrendingUp, FiTrendingDown, FiArchive } from 'react-icons/fi';
import { Card, CardContent } from './ui/Card';

const BalanceCard = ({ balance }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-white border-none shadow-sm h-full rounded-md">
      <CardContent className="p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Ringkasan</h2>

        <div className="space-y-3">
          {/* Balance */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs text-slate-500 font-medium">Saldo</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(balance?.balance || 0)}
            </span>
          </div>

          {/* Income */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs text-slate-500 font-medium">Pemasukan</span>
            <span className="text-base font-bold text-green-600">
              {formatCurrency(balance?.total_income || 0)}
            </span>
          </div>

          {/* Expense */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Pengeluaran</span>
            <span className="text-base font-bold text-red-600">
              {formatCurrency(balance?.total_expense || 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;