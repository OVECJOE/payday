'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import type { Transaction } from '@/lib/types';

interface TransactionsListProps {
  initialTransactions: Transaction[];
  total: number;
}

export function TransactionsList({ initialTransactions, total }: TransactionsListProps) {
  if (initialTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No transactions</CardTitle>
          <CardDescription>Your transaction history will appear here</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>{total} total transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initialTransactions.map((transaction) => (
            <Link
              key={transaction.id}
              href={`/dashboard/transactions/${transaction.id}`}
              className="block"
            >
              <div className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted/60">
                <div className="space-y-1">
                  <p className="font-medium">
                    {transaction.recipient?.name || 'Payment'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                  <p
                    className={`text-sm ${
                      transaction.status === 'success'
                        ? 'text-green-600'
                        : transaction.status === 'failed'
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

