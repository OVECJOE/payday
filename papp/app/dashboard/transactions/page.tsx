import { apiServer } from '@/lib/api-server'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Transaction {
  id: string
  recipient: {
    name: string
    bankName: string
  }
  amount: number
  status: string
  type: string
  createdAt: string
}

async function getTransactions() {
  try {
    const result = await apiServer.transactions.list(100, 0)
    return result as { transactions: Transaction[]; total: number }
  } catch {
    return { transactions: [], total: 0 }
  }
}

export default async function TransactionsPage() {
  const { transactions, total } = await getTransactions()

  const statusColors = {
    success: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
    pending: 'text-yellow-600 bg-yellow-50',
    processing: 'text-blue-600 bg-blue-50',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          View all your payment history
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">No transactions yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Your payment history will appear here once you start making payments.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Recipient</th>
                  <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Amount</th>
                  <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Status</th>
                  <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm hidden sm:table-cell">Type</th>
                  <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Date</th>
                  <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm hidden lg:table-cell">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-2 sm:p-4">
                      <div className="font-medium text-xs sm:text-sm">
                        {transaction.recipient?.name || '—'}
                      </div>
                      {transaction.recipient?.bankName && (
                        <div className="text-xs text-muted-foreground">
                          {transaction.recipient.bankName}
                        </div>
                      )}
                    </td>
                    <td className="p-2 sm:p-4 font-semibold text-xs sm:text-sm">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="p-2 sm:p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[transaction.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-50'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground capitalize hidden sm:table-cell">
                      {transaction.type.replace('_', ' ')}
                    </td>
                    <td className="p-2 sm:p-4 text-xs sm:text-sm">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="p-2 sm:p-4 text-xs font-mono text-muted-foreground hidden lg:table-cell">
                      {transaction.id.slice(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
            Showing {transactions.length} of {total} transactions
          </div>
        </div>
      )}
    </div>
  )
}
