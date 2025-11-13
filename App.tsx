import React from 'react';
import type { PaymentItem } from './types';

// Let TypeScript know about the CDN libraries
declare const jspdf: any;

// --- DATA CONSTANTS (Fallbacks) ---
const initialUnpresentedChequesData: PaymentItem[] = [
  { id: crypto.randomUUID(), name: "OPTIVEN LIMITED", details: "LOAN REPAYMENT", amount: 500000, date: '2025-11-01' },
  { id: crypto.randomUUID(), name: "AWINJA", details: "MARKETING", amount: 250000, date: '2025-11-02' },
  { id: crypto.randomUUID(), name: "WAJI WATER COMPANY", details: "SUPPLY OF BOTTLED WATER", amount: 35000, date: '2025-11-05' },
  { id: crypto.randomUUID(), name: "AIRDROP WATER COMPANY", details: "SUPPLY OF BOTTLED WATER & ICE CUBES", amount: 37300, date: '2025-11-06' },
  { id: crypto.randomUUID(), name: "HORECA HOSPITALITY", details: "SUPPLY OF HONEY", amount: 20000, date: '2025-11-08' },
  { id: crypto.randomUUID(), name: "LIQUID TELECOMMUNICATIONS", details: "INTERNET", amount: 36018, date: '2025-11-09' },
  { id: crypto.randomUUID(), name: "THINK PINK HYGIENE", details: "BIN SERVICE", amount: 26573, date: '2025-11-10' },
  { id: crypto.randomUUID(), name: "KPLC", details: "ELECTRICITY", amount: 392231, date: '2025-11-11' },
];

const initialForApprovalData: PaymentItem[] = [
  { id: crypto.randomUUID(), name: "EBENEZER MEAT SUPPLY", details: "SUPPLY OF MEAT ITEMS", amount: 263900, date: '2025-11-04' },
  { id: crypto.randomUUID(), name: "DAVIES AND SHIRTLIFF", details: "SWIMMING POOL CHEMICALS", amount: 150976, date: '2025-11-07' },
];

const initialWeeklyRequisitionData: PaymentItem[] = [
    { id: crypto.randomUUID(), name: "CASUALS (APPROXIMATE)", details: "Weekly casual worker payments", amount: 225160, date: '2025-11-10' },
];

const initialBalances = {
    equity: 1495664,
    till: 0,
    pesapal: 0,
};


// --- SORTING HOOK ---
type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: keyof PaymentItem;
  direction: SortDirection;
}

const useSortableData = (items: PaymentItem[], config: SortConfig | null = null) => {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(config);

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof PaymentItem) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

// --- UTILITY FUNCTIONS ---
const formatCurrency = (num: number): string => {
  const formatted = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return num < 0 ? `(${formatted})` : formatted;
};

const formatDateForDisplay = (dateString: string) => {
    if (!dateString || !dateString.includes('-')) return '';
    // To avoid timezone issues with `new Date()`, we manually parse the YYYY-MM-DD string
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


// --- UI HELPER COMPONENTS ---

const DashboardHeader: React.FC<{ scheduleDate: string; onDateChange: (newDate: string) => void; onExport: () => void; onDownloadPDF: () => void; isGeneratingPdf: boolean; }> = ({ scheduleDate, onDateChange, onExport, onDownloadPDF, isGeneratingPdf }) => {

    return (
      <header className="bg-white p-4 sm:p-6 border-b-2 border-gray-100" data-no-print>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center">
            <div className="bg-red-600 text-white p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">GMC Place Payment Schedule</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                  <span>AS AT</span>
                  <input 
                      type="date" 
                      value={scheduleDate} 
                      onChange={(e) => onDateChange(e.target.value)}
                      className="p-1 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      aria-label="Schedule Date"
                  />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
              <button onClick={onExport} className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors shadow-sm text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export CSV</span>
              </button>
              <button onClick={onDownloadPDF} disabled={isGeneratingPdf} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm disabled:bg-blue-400 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
              </button>
          </div>
        </div>
      </header>
    );
};

const StatsCard: React.FC<{title: string; value: number; color: string; icon: React.ReactNode}> = ({ title, value, color, icon }) => (
    <div className="stats-card bg-white p-4 rounded-lg shadow-md flex items-center print:bg-gray-100 print:break-inside-avoid">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-semibold">{title}</p>
            <p className={`text-2xl font-bold ${value < 0 ? 'text-red-600' : 'text-gray-800'}`}>{formatCurrency(value)}</p>
        </div>
    </div>
);

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  total: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, total }) => {
  const size = 220;
  const strokeWidth = 25;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = -90; // Start from the top

  const segments = data.map(item => {
    const percentage = total === 0 ? 0 : (item.value / total) * 100;
    const offset = circumference - (percentage / 100) * circumference;
    const rotation = accumulatedAngle;
    accumulatedAngle += (percentage / 100) * 360;

    return { ...item, percentage, offset, rotation };
  });

  return (
    <div data-no-print className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
      <h3 className="font-bold text-gray-700 mb-4">Expense Breakdown</h3>
      <div className="relative w-[220px] h-[220px]">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e6e6e6" strokeWidth={strokeWidth} />
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={segment.offset}
              transform={`rotate(${segment.rotation} ${size / 2} ${size / 2})`}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
           <span className="text-xs text-gray-500">Grand Total</span>
           <span className="text-xl font-bold text-gray-800">{formatCurrency(total)}</span>
        </div>
      </div>
      <div className="w-full mt-4 space-y-2 text-sm">
        {segments.map((segment, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></span>
              <span>{segment.label}</span>
            </div>
            <div className="font-semibold text-gray-700">
              {segment.percentage.toFixed(1)}%
              <span className="text-xs text-gray-500 ml-2">({formatCurrency(segment.value)})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


interface DataTableProps {
  title: string;
  items: PaymentItem[];
  totalLabel: string;
  totalAmount: number;
  sortConfig: SortConfig | null;
  onSort: (key: keyof PaymentItem) => void;
  onDeleteItem: (id: string) => void;
  onAddNewEntry: () => void;
  onEditItem: (id: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ title, items, totalLabel, totalAmount, onSort, sortConfig, onDeleteItem, onAddNewEntry, onEditItem }) => {
  
  const SortableHeader: React.FC<{ sortKey: keyof PaymentItem; label: string; className?: string }> = ({ sortKey, label, className = '' }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕';
    const iconColor = isSorted ? 'text-white' : 'text-gray-400';

    return (
      <th className={`p-0 font-semibold ${className}`}>
        <button
          type="button"
          data-no-print
          onClick={() => onSort(sortKey)}
          className="p-3 w-full h-full flex items-center transition-colors duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          style={{justifyContent: className.includes('text-right') ? 'flex-end' : 'flex-start'}}
          aria-label={`Sort by ${label} ${isSorted ? (sortConfig.direction === 'ascending' ? 'in ascending order' : 'in descending order') : ''}`}
        >
          {label}
          <span className={`ml-2 text-xs ${iconColor}`}>{directionIcon}</span>
        </button>
        <span className="hidden print:inline p-3">{label}</span>
      </th>
    );
  };
  
  return (
  <section className="mb-8 break-inside-avoid bg-white rounded-lg shadow-md overflow-hidden">
    <header className="flex justify-between items-center p-4 bg-gray-50 border-b print:hidden">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button type="button" onClick={onAddNewEntry} data-no-print className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors shadow-sm">+ Add New</button>
    </header>
    <h3 className="hidden print:block text-lg font-bold text-gray-800 p-4 bg-gray-50 border-b">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-auto">
        <thead className="bg-gray-700 text-white">
          <tr>
            <SortableHeader sortKey="name" label="PAYEE / SUPPLIER" />
            <SortableHeader sortKey="details" label="DETAILS" />
            <SortableHeader sortKey="date" label="DATE" />
            <SortableHeader sortKey="amount" label="AMOUNT" className="text-right" />
            <th data-no-print className="p-3 text-right font-semibold">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200 even:bg-gray-50 hover:bg-yellow-100 transition-colors">
              <td className="p-3 whitespace-nowrap">{item.name}</td>
              <td className="p-3 whitespace-nowrap">{item.details}</td>
              <td className="p-3 whitespace-nowrap font-mono">{formatDateForDisplay(item.date)}</td>
              <td className="p-3 text-right font-mono">{formatCurrency(item.amount)}</td>
              <td data-no-print className="p-3 text-right space-x-2">
                <button
                  onClick={() => onEditItem(item.id)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  aria-label={`Edit item ${item.name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                      if (window.confirm('Are you sure you want to delete this item?')) {
                          onDeleteItem(item.id);
                      }
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  aria-label={`Delete item ${item.name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
            {items.length === 0 && (
                <tr className="border-b border-gray-200"><td colSpan={5} className="p-8 text-center text-gray-500">No entries for the selected date.</td></tr>
            )}
        </tbody>
        <tfoot className="font-bold bg-blue-100 text-blue-800">
             <tr className="border-t-2 border-blue-200">
                <td colSpan={3} className="p-3">{totalLabel}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(totalAmount)}</td>
                <td data-no-print></td>
            </tr>
        </tfoot>
      </table>
    </div>
  </section>
)};

interface EditableSummaryItemProps {
  label: string;
  value: number;
  onValueChange: (newValue: number) => void;
}

const EditableSummaryItem: React.FC<EditableSummaryItemProps> = ({ label, value, onValueChange }) => {
  const [inputValue, setInputValue] = React.useState<string>(String(value));

  React.useEffect(() => {
    setInputValue(String(value.toFixed(2)));
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsedValue = parseFloat(e.target.value);
    const finalValue = isNaN(parsedValue) ? 0 : parseFloat(parsedValue.toFixed(2));
    onValueChange(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex justify-between items-center p-3">
      <label htmlFor={label} className="flex-1 font-semibold text-gray-600">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-2 text-gray-500 text-sm">KSh</span>
        <input
          id={label}
          type="number"
          step="0.01"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="font-mono text-right bg-gray-100 p-1 pl-9 rounded w-48 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          aria-label={label}
        />
      </div>
    </div>
  );
};

const PrintableSummaryItem: React.FC<{label: string; value: number}> = ({ label, value }) => (
    <div className="flex justify-between items-center p-2 border-b">
        <span className="font-semibold text-gray-600">{label}</span>
        <span className="font-mono">{formatCurrency(value)}</span>
    </div>
);


const AppFooter: React.FC = () => (
  <footer data-no-print className="text-center text-sm text-white bg-red-600 rounded-lg py-4 mt-8 font-semibold">
    Contact: 0701 560 560 | Email: info@funplace.co.ke | Web: www.funplace.co.ke
  </footer>
);

// --- MODAL COMPONENT ---
interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PaymentItem, 'id'>) => void;
  title: string;
  initialData?: Partial<PaymentItem>;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onSave, title, initialData }) => {
  const [newItem, setNewItem] = React.useState({ name: '', details: '', amount: '', date: '' });

  React.useEffect(() => {
    if (isOpen) {
        setNewItem({
            name: initialData?.name || '',
            details: initialData?.details || '',
            amount: initialData?.amount ? String(initialData.amount) : '',
            date: initialData?.date || ''
        });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newItem.amount);
    if (!newItem.name.trim() || !newItem.date || isNaN(amountNum) || amountNum <= 0) {
      alert("Invalid entry! Payee/Supplier, Date, and a positive Amount are required.");
      return;
    }
    const roundedAmount = parseFloat(amountNum.toFixed(2));
    onSave({
      name: newItem.name.trim(),
      details: newItem.details.trim(),
      amount: roundedAmount,
      date: newItem.date,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog" data-no-print>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold" aria-label="Close modal">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Payee / Supplier</label>
              <input type="text" id="name" name="name" value={newItem.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details</label>
              <input type="text" id="details" name="details" value={newItem.details} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" id="date" name="date" value={newItem.date} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (KSh)</label>
                <input type="number" id="amount" name="amount" value={newItem.amount} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required step="0.01" min="0.01" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

type TableType = 'unpresented' | 'approval' | 'weeklyRequisition';

interface ModalState {
  isOpen: boolean;
  targetTable: TableType | null;
  mode: 'add' | 'edit';
  editId: string | null;
  itemData?: Partial<PaymentItem>;
}

const App: React.FC = () => {
    
  const [unpresentedCheques, setUnpresentedCheques] = React.useState<PaymentItem[]>([]);
  const [forApprovalItems, setForApprovalItems] = React.useState<PaymentItem[]>([]);
  const [weeklyRequisitionItems, setWeeklyRequisitionItems] = React.useState<PaymentItem[]>([]);
  const [equityAccountBalance, setEquityAccountBalance] = React.useState<number>(initialBalances.equity);
  const [tillBalance, setTillBalance] = React.useState<number>(initialBalances.till);
  const [pesapalBalance, setPesapalBalance] = React.useState<number>(initialBalances.pesapal);
  const [scheduleDate, setScheduleDate] = React.useState('2025-11-11');
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  const [modalState, setModalState] = React.useState<ModalState>({
    isOpen: false,
    targetTable: null,
    mode: 'add',
    editId: null,
    itemData: undefined,
  });


  React.useEffect(() => {
    try {
        const savedData = localStorage.getItem('gmcPaymentData');
        if (savedData) {
            const data = JSON.parse(savedData);
            setUnpresentedCheques(data.unpresented || initialUnpresentedChequesData);
            setForApprovalItems(data.approval || initialForApprovalData);
            setWeeklyRequisitionItems(data.weeklyRequisition || initialWeeklyRequisitionData);
            setEquityAccountBalance(data.balances?.equity ?? initialBalances.equity);
            setTillBalance(data.balances?.till ?? initialBalances.till);
            setPesapalBalance(data.balances?.pesapal ?? initialBalances.pesapal);
            setScheduleDate(data.scheduleDate || '2025-11-11');
        } else {
             setUnpresentedCheques(initialUnpresentedChequesData);
             setForApprovalItems(initialForApprovalData);
             setWeeklyRequisitionItems(initialWeeklyRequisitionData);
             setEquityAccountBalance(initialBalances.equity);
             setTillBalance(initialBalances.till);
             setPesapalBalance(initialBalances.pesapal);
             setScheduleDate('2025-11-11');
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setUnpresentedCheques(initialUnpresentedChequesData);
        setForApprovalItems(initialForApprovalData);
        setWeeklyRequisitionItems(initialWeeklyRequisitionData);
        setEquityAccountBalance(initialBalances.equity);
        setTillBalance(initialBalances.till);
        setPesapalBalance(initialBalances.pesapal);
    }
  }, []);

  React.useEffect(() => {
    try {
        const dataToSave = {
            unpresented: unpresentedCheques,
            approval: forApprovalItems,
            weeklyRequisition: weeklyRequisitionItems,
            balances: {
                equity: equityAccountBalance,
                till: tillBalance,
                pesapal: pesapalBalance,
            },
            scheduleDate: scheduleDate,
        };
        localStorage.setItem('gmcPaymentData', JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Failed to save data to localStorage", error);
    }
  }, [unpresentedCheques, forApprovalItems, weeklyRequisitionItems, equityAccountBalance, tillBalance, pesapalBalance, scheduleDate]);

  // Filter data based on scheduleDate
  const filteredUnpresented = React.useMemo(() => unpresentedCheques.filter(item => item.date <= scheduleDate), [unpresentedCheques, scheduleDate]);
  const filteredForApproval = React.useMemo(() => forApprovalItems.filter(item => item.date <= scheduleDate), [forApprovalItems, scheduleDate]);
  const filteredWeeklyRequisition = React.useMemo(() => weeklyRequisitionItems.filter(item => item.date <= scheduleDate), [weeklyRequisitionItems, scheduleDate]);

  const { items: sortedUnpresented, requestSort: requestSortUnpresented, sortConfig: unpresentedSortConfig } = useSortableData(filteredUnpresented);
  const { items: sortedForApproval, requestSort: requestSortForApproval, sortConfig: forApprovalSortConfig } = useSortableData(filteredForApproval);
  const { items: sortedWeeklyRequisition, requestSort: requestSortWeeklyRequisition, sortConfig: weeklyRequisitionSortConfig } = useSortableData(filteredWeeklyRequisition);
  
  const totalUnpresented = filteredUnpresented.reduce((sum, item) => sum + item.amount, 0);
  const totalApproval = filteredForApproval.reduce((sum, item) => sum + item.amount, 0);
  const totalWeeklyRequisition = filteredWeeklyRequisition.reduce((sum, item) => sum + item.amount, 0);

  const grandTotal = totalUnpresented + totalApproval + totalWeeklyRequisition;
  const deficitOrSurplus = equityAccountBalance - grandTotal;
  const totalClosingBalance = deficitOrSurplus + tillBalance + pesapalBalance;

  const handleCloseModal = () => {
    setModalState({ isOpen: false, targetTable: null, mode: 'add', editId: null, itemData: undefined });
  };

  const handleAddNew = (targetTable: TableType) => {
    setModalState({
      isOpen: true,
      targetTable,
      mode: 'add',
      editId: null,
      itemData: { name: '', details: '', amount: 0, date: scheduleDate },
    });
  };

  const handleEdit = (targetTable: TableType, id: string) => {
    let sourceArray: PaymentItem[];
    switch(targetTable) {
        case 'unpresented': sourceArray = unpresentedCheques; break;
        case 'approval': sourceArray = forApprovalItems; break;
        case 'weeklyRequisition': sourceArray = weeklyRequisitionItems; break;
        default: sourceArray = [];
    }
    const itemToEdit = sourceArray.find(item => item.id === id);

    if (itemToEdit) {
      setModalState({
        isOpen: true,
        targetTable,
        mode: 'edit',
        editId: id,
        itemData: itemToEdit,
      });
    }
  };

  const handleSaveItem = (item: Omit<PaymentItem, 'id'>) => {
    const { targetTable, mode, editId } = modalState;

    const updateState = (setter: React.Dispatch<React.SetStateAction<PaymentItem[]>>) => {
        if (mode === 'edit' && editId) {
            setter(prev => prev.map(oldItem => oldItem.id === editId ? { ...oldItem, ...item } : oldItem));
        } else {
            setter(prev => [...prev, { ...item, id: crypto.randomUUID() }]);
        }
    };

    switch (targetTable) {
      case 'unpresented': updateState(setUnpresentedCheques); break;
      case 'approval': updateState(setForApprovalItems); break;
      case 'weeklyRequisition': updateState(setWeeklyRequisitionItems); break;
    }
    handleCloseModal();
  };
  
  const handleDeleteUnpresented = (idToDelete: string) => setUnpresentedCheques(prev => prev.filter(item => item.id !== idToDelete));
  const handleDeleteForApproval = (idToDelete: string) => setForApprovalItems(prev => prev.filter(item => item.id !== idToDelete));
  const handleDeleteWeeklyRequisition = (idToDelete: string) => setWeeklyRequisitionItems(prev => prev.filter(item => item.id !== idToDelete));
  
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
        const { jsPDF } = jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const pageMargin = 40;
        let finalY = 0;

        // --- PDF Header ---
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('GMC PAYMENT SCHEDULE', doc.internal.pageSize.getWidth() / 2, pageMargin, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`AS AT ${new Date(scheduleDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}`, doc.internal.pageSize.getWidth() / 2, pageMargin + 20, { align: 'center' });
        
        finalY = pageMargin + 40;

        // --- PDF Table Drawer ---
        const drawTable = (title: string, data: PaymentItem[], totalLabel: string, totalAmount: number) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, pageMargin, finalY - 10);

            const tableHeaders = [['Date', 'Payee / Supplier', 'Details', 'Amount (KSh)']];
            const tableBody = data.map(item => [
                formatDateForDisplay(item.date),
                item.name,
                item.details,
                { content: formatCurrency(item.amount), styles: { halign: 'right' } }
            ]);
            
            tableBody.push([
// FIX: Cast style objects to 'any' to bypass overly strict type inference. The 'fontStyle' property is correct for jspdf-autotable.
                { content: totalLabel, colSpan: 3, styles: { fontStyle: 'bold', fillColor: '#e0e7ff', textColor: '#3730a3' } as any },
// FIX: Cast style objects to 'any' to bypass overly strict type inference. The 'fontStyle' property is correct for jspdf-autotable.
                { content: formatCurrency(totalAmount), styles: { halign: 'right', fontStyle: 'bold', fillColor: '#e0e7ff', textColor: '#3730a3' } as any }
            ]);

            (doc as any).autoTable({
                head: tableHeaders,
                body: tableBody,
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: '#374151', textColor: '#ffffff' },
                columnStyles: { 3: { halign: 'right' } },
            });
            
            finalY = (doc as any).lastAutoTable.finalY + 30;
        };
        
        drawTable("UNPRESENTED CHEQUES", sortedUnpresented, "TOTAL UNPRESENTED CHEQUES", totalUnpresented);
        drawTable("CHEQUES/PAYMENTS FOR APPROVAL", sortedForApproval, "TOTAL CHEQUES/PAYMENTS FOR APPROVAL", totalApproval);
        drawTable("WEEKLY REQUISITION", sortedWeeklyRequisition, "TOTAL WEEKLY REQUISITIONS", totalWeeklyRequisition);

        // --- PDF Summary Section ---
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Balances", pageMargin, finalY - 10);
        
        const summaryData = [
            ['GRAND TOTAL (Expenses)', formatCurrency(grandTotal)],
            ['EQUITY ACCOUNT BALANCE', formatCurrency(equityAccountBalance)],
            ['DEFICIT / SURPLUS', formatCurrency(deficitOrSurplus)],
            ['TILL BALANCE', formatCurrency(tillBalance)],
            ['PESAPAL BALANCE', formatCurrency(pesapalBalance)],
            ['TOTAL CLOSING ACCOUNT BALANCES', formatCurrency(totalClosingBalance)],
        ];
        
        (doc as any).autoTable({
            body: summaryData,
            startY: finalY,
            theme: 'plain',
            styles: { fontSize: 10 },
            columnStyles: { 
                0: { fontStyle: 'bold', cellWidth: 250 },
                1: { halign: 'right' } 
            },
            didParseCell: (data: any) => {
                if (data.row.index === 0 || data.row.index === 5) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = '#f3f4f6';
                }
                if (data.row.index === 2 && deficitOrSurplus < 0) {
                    data.cell.styles.textColor = '#dc2626';
                }
            }
        });

        // --- PDF Footer ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - pageMargin, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
            doc.text("Contact: 0701 560 560 | Email: info@funplace.co.ke | Web: www.funplace.co.ke", doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
        }

        doc.save(`GMC_Payment_Schedule_${scheduleDate}.pdf`);
    } catch (err) {
        console.error("Failed to generate PDF", err);
        alert("An error occurred while generating the PDF. Please try again.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };
  
  const handleExportCSV = () => {
    const escapeCsvCell = (cell: any) => {
        const cellStr = String(cell).trim();
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
    };
    
    let csvContent = "";
    
    const date = new Date(scheduleDate);
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const formattedDate = utcDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    csvContent += `GMC PAYMENT SCHEDULE\n`;
    csvContent += `AS AT ${formattedDate}\n\n`;

    const headers = ["NAME", "DETAILS", "DATE", "AMOUNT"];
    
    const addSection = (title: string, items: PaymentItem[], totalLabel: string, total: number) => {
        csvContent += `${title}\n`;
        csvContent += headers.join(",") + "\n";
        items.forEach(item => {
            csvContent += [escapeCsvCell(item.name), escapeCsvCell(item.details), item.date, item.amount.toFixed(2)].join(",") + "\n";
        });
        csvContent += `${totalLabel},,,${total.toFixed(2)}\n\n`;
    };

    addSection("UNPRESENTED CHEQUES", filteredUnpresented, "TOTAL UNPRESENTED CHEQUES", totalUnpresented);
    addSection("CHEQUES/PAYMENTS FOR APPROVAL", filteredForApproval, "TOTAL CHEQUES/PAYMENTS FOR APPROVAL", totalApproval);
    addSection("WEEKLY REQUISITION", filteredWeeklyRequisition, "TOTAL WEEKLY REQUISITIONS", totalWeeklyRequisition);
    
    csvContent += "SUMMARY\n";
    csvContent += `GRAND TOTAL,${grandTotal.toFixed(2)}\n`;
    csvContent += `EQUITY ACCOUNT BALANCE,${equityAccountBalance.toFixed(2)}\n`;
    csvContent += `DEFICIT/SURPLUS,${deficitOrSurplus.toFixed(2)}\n`;
    csvContent += `TILL BALANCE,${tillBalance.toFixed(2)}\n`;
    csvContent += `PESAPAL BALANCE,${pesapalBalance.toFixed(2)}\n`;
    csvContent += `TOTAL CLOSING ACCOUNT BALANCES,${totalClosingBalance.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `GMC_Payment_Schedule_${scheduleDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const getModalTitle = () => {
      const action = modalState.mode === 'edit' ? 'Edit' : 'Add New';
      switch (modalState.targetTable) {
        case 'unpresented': return `${action} Entry for Unpresented Cheques`;
        case 'approval': return `${action} Entry for Payments for Approval`;
        case 'weeklyRequisition': return `${action} Entry for Weekly Requisition`;
        default: return `${action} Entry`;
      }
  }


  return (
    <div className="dashboard-container max-w-7xl mx-auto my-8 bg-gray-50 rounded-lg shadow-2xl overflow-hidden">
      <DashboardHeader 
        scheduleDate={scheduleDate} 
        onDateChange={setScheduleDate} 
        onExport={handleExportCSV} 
        onDownloadPDF={handleDownloadPDF}
        isGeneratingPdf={isGeneratingPdf}
      />
      
      <main className="p-4 sm:p-6">
            
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatsCard title="Grand Total (Expenses)" value={grandTotal} color="bg-red-100 text-red-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} />
            <StatsCard title="Equity Account Balance" value={equityAccountBalance} color="bg-green-100 text-green-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m16-5H4" /></svg>} />
            <StatsCard title="Deficit / Surplus" value={deficitOrSurplus} color="bg-blue-100 text-blue-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
            <StatsCard title="Total Closing Balance" value={totalClosingBalance} color="bg-yellow-100 text-yellow-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
          </div>
          <div className="lg:col-span-1">
            <DonutChart data={[
                {label: 'Unpresented', value: totalUnpresented, color: '#ef4444'},
                {label: 'For Approval', value: totalApproval, color: '#3b82f6'},
                {label: 'Weekly Req.', value: totalWeeklyRequisition, color: '#f59e0b'}
            ]} total={grandTotal} />
          </div>
        </section>

        <DataTable
          title="UNPRESENTED CHEQUES"
          items={sortedUnpresented}
          totalLabel="TOTAL UNPRESENTED CHEQUES"
          totalAmount={totalUnpresented}
          onSort={requestSortUnpresented}
          sortConfig={unpresentedSortConfig}
          onDeleteItem={handleDeleteUnpresented}
          onAddNewEntry={() => handleAddNew('unpresented')}
          onEditItem={(id) => handleEdit('unpresented', id)}
        />

        <DataTable
          title="CHEQUES/PAYMENTS FOR APPROVAL"
          items={sortedForApproval}
          totalLabel="TOTAL CHEQUES/PAYMENTS FOR APPROVAL"
          totalAmount={totalApproval}
          onSort={requestSortForApproval}
          sortConfig={forApprovalSortConfig}
          onDeleteItem={handleDeleteForApproval}
          onAddNewEntry={() => handleAddNew('approval')}
          onEditItem={(id) => handleEdit('approval', id)}
        />
        
        <DataTable
          title="WEEKLY REQUISITION"
          items={sortedWeeklyRequisition}
          totalLabel="TOTAL WEEKLY REQUISITIONS"
          totalAmount={totalWeeklyRequisition}
          onSort={requestSortWeeklyRequisition}
          sortConfig={weeklyRequisitionSortConfig}
          onDeleteItem={handleDeleteWeeklyRequisition}
          onAddNewEntry={() => handleAddNew('weeklyRequisition')}
          onEditItem={(id) => handleEdit('weeklyRequisition', id)}
        />
        
        <section className="mt-6 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Balances</h3>
            {/* Screen-only version with inputs */}
            <div className="divide-y">
                <EditableSummaryItem label="EQUITY ACCOUNT BALANCE" value={equityAccountBalance} onValueChange={setEquityAccountBalance} />
                <EditableSummaryItem label="TILL BALANCE" value={tillBalance} onValueChange={setTillBalance} />
                <EditableSummaryItem label="PESAPAL BALANCE" value={pesapalBalance} onValueChange={setPesapalBalance} />
                <div className="flex justify-between items-center p-3 mt-2 font-bold bg-gray-200 text-gray-800 rounded-b-md">
                    <span>TOTAL CLOSING ACCOUNT BALANCES</span>
                    <span className="font-mono">{formatCurrency(totalClosingBalance)}</span>
                </div>
            </div>
        </section>
      </main>
      
      <AppFooter />
      
      <AddEntryModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        title={getModalTitle()}
        initialData={modalState.itemData}
      />
    </div>
  );
};

export default App;
