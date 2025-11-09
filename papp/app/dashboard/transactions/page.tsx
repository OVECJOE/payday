import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

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
    const result = await api.transactions.list(100, 0)
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
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View all your payment history
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
          <h3 className="text-lg font-semibold">No transactions yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your payment history will appear here once you start making payments.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Recipient</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">
                        {transaction.recipient?.name || '—'}
                      </div>
                      {transaction.recipient?.bankName && (
                        <div className="text-sm text-muted-foreground">
                          {transaction.recipient.bankName}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[transaction.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-50'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground capitalize">
                      {transaction.type.replace('_', ' ')}
                    </td>
                    <td className="p-4 text-sm">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="p-4 text-xs font-mono text-muted-foreground">
                      {transaction.id.slice(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t p-4 text-sm text-muted-foreground">
            Showing {transactions.length} of {total} transactions
          </div>
        </div>
      )}
    </div>
  )
}
