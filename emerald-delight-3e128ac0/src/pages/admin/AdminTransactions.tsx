import { useState, useEffect } from "react";
import { Receipt, Loader2, ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { transactionApi, Transaction } from "@/services/transaction.services";

const PAGE_TITLE = "Transactions";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [summary, setSummary] = useState({
    totalCredits: 0,
    totalDebits: 0,
    balance: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      // Fetch transactions from API
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionApi.getAll(),
        transactionApi.getSummary(),
      ]);
      
      if (transactionsRes.success && transactionsRes.data) {
        setTransactions(transactionsRes.data);
      }
      
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' ? true : t.type === filter
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          Transactions
        </h1>
        <p className="text-muted-foreground">
          View all payment transactions and refunds
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">
            ₹{summary.totalCredits.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">From registrations</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Refunds</span>
          </div>
          <p className="text-2xl font-bold text-red-500">
            ₹{summary.totalDebits.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Processed refunds</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-gold" />
            </div>
            <span className="text-sm text-muted-foreground">Net Balance</span>
          </div>
          <p className="text-2xl font-bold text-gold">
            ₹{summary.balance.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Current balance</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gold text-emerald-dark'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All Transactions
        </button>
        <button
          onClick={() => setFilter('credit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'credit'
              ? 'bg-emerald-500 text-white'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Payments (Credit)
        </button>
        <button
          onClick={() => setFilter('debit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'debit'
              ? 'bg-red-500 text-white'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Refunds (Debit)
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Event</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Invoice</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">{transaction.description}</span>
                      </div>
                      {transaction.participantName && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {transaction.participantName}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {transaction.eventName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                      {transaction.invoiceNumber || '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      transaction.type === 'credit' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-gold/5 border border-gold/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Receipt className="w-5 h-5 text-gold mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground">Transaction Types</h3>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-emerald-500 font-medium">Credits (+)</span> - Registration payments received<br />
              <span className="text-red-500 font-medium">Debits (-)</span> - Refunds processed for cancelled events or participant requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
