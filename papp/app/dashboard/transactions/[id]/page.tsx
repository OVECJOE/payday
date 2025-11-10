import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTransactionAction } from '@/app/actions/transactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';

interface TransactionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Transaction Details - Payday',
};

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = await params;
  const transaction = await getTransactionAction(id).catch(() => null);
  if (!transaction) notFound();

  const detailRows: Array<{ label: string; value: string | number | undefined }> = [
    { label: 'Transaction Type', value: transaction.type },
    { label: 'Status', value: transaction.status },
    { label: 'Amount', value: formatCurrency(transaction.amount) },
    { label: 'Fee', value: formatCurrency(transaction.fee || 0) },
    { label: 'Provider', value: transaction.provider },
    { label: 'Provider Reference', value: transaction.providerReference },
    { label: 'Created At', value: format(new Date(transaction.createdAt), 'PPPpp') },
    {
      label: 'Completed At',
      value: transaction.completedAt
        ? format(new Date(transaction.completedAt), 'PPPpp')
        : '—',
    },
    { label: 'Idempotency Key', value: transaction.idempotencyKey },
    { label: 'Retry Count', value: transaction.retryCount },
    { label: 'Failure Reason', value: transaction.failureReason },
  ];

  const metadataObject =
    transaction.metadata &&
    typeof transaction.metadata === 'object' &&
    Object.keys(transaction.metadata).length > 0
      ? transaction.metadata
      : null;

  const providerResponseObject =
    transaction.providerResponse &&
    typeof transaction.providerResponse === 'object' &&
    Object.keys(transaction.providerResponse).length > 0
      ? transaction.providerResponse
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
          <p className="text-muted-foreground">
            Detailed view of transaction {" "}
            <code className="font-mono bg-muted px-1 py-0.5 rounded-md text-sm">
              {transaction.id.slice(0, 4)}...{transaction.id.slice(-4)}
            </code>
          </p>
        </div>
        <Link href="/dashboard/transactions">
          <Button variant="outline" size="sm">
            Back <span className='text-primary-foreground font-medium hidden md:inline'>to transactions</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Core information about this transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailRows.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium sm:text-right break-all">
                  {value !== undefined && value !== null && value !== ''
                    ? value
                    : '—'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipient</CardTitle>
            <CardDescription>Beneficiary of this transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">
                {transaction.recipient?.name || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span className="text-sm font-medium">
                {transaction.recipient?.bankName || '—'}
              </span>
            </div>
            {transaction.description && (
              <div className="space-y-1 text-sm">
                <span className="text-muted-foreground">Description</span>
                <p className="font-medium">{transaction.description}</p>
              </div>
            )}
            {transaction.failureReason && (
              <div className="space-y-1 text-sm text-destructive">
                <span className="text-muted-foreground">Failure Reason</span>
                <p className="font-medium">{transaction.failureReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {metadataObject && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Additional data attached to this transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border bg-muted/30">
              <pre className="overflow-x-auto p-4 text-sm">
{JSON.stringify(metadataObject, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {providerResponseObject && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Response</CardTitle>
            <CardDescription>Raw response returned by the payment provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border bg-muted/30">
              <pre className="overflow-x-auto p-4 text-sm">
{JSON.stringify(providerResponseObject, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
