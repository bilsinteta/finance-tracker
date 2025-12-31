import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';

const TransactionTable = ({ transactions, pagination, onPageChange, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card className="bg-white border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Deskripsi</th>
                                <th className="px-6 py-4 text-right">Jumlah</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                        Belum ada transaksi
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-700">{formatDate(tx.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${tx.category?.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="font-medium text-slate-700">{tx.category?.name || 'Uncategorized'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{tx.description || '-'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${tx.category?.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.category?.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center gap-2">
                                                <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors" onClick={() => onEdit(tx)}>
                                                    <FiEdit2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" onClick={() => onDelete(tx.id)}>
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        <span className="text-xs font-medium text-slate-500">
                            Halaman {pagination.currentPage} dari {pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.currentPage <= 1}
                                onClick={() => onPageChange(pagination.currentPage - 1)}
                                className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                            >
                                <FiChevronLeft className="mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.currentPage >= pagination.totalPages}
                                onClick={() => onPageChange(pagination.currentPage + 1)}
                                className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                            >
                                Next <FiChevronRight className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TransactionTable;
