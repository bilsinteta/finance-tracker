import { Card, CardContent } from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';

const TransactionFilters = ({ filters, setFilters, categories }) => {
    return (
        <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <h3 className="font-semibold text-lg text-slate-700">Arus Kas</h3>
                    <div className="flex gap-2 flex-wrap">
                        <Select
                            value={filters.category_id}
                            onChange={(e) => setFilters({ ...filters, category_id: e.target.value, page: 1 })}
                            className="h-9 w-[150px] text-sm"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Select>
                        <Input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
                            className="h-9 w-auto text-sm"
                        />
                        <Input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
                            className="h-9 w-auto text-sm"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TransactionFilters;
