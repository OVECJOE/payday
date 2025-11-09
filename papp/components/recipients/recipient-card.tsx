'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteRecipientAction } from '@/app/actions/recipients';
import { toast } from 'sonner';
import type { Recipient } from '@/lib/types';

interface RecipientCardProps {
  recipient: Recipient;
  onDeleted: (id: string) => void;
}

export function RecipientCard({ recipient, onDeleted }: RecipientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipient?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteRecipientAction(recipient.id);
    setIsDeleting(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Recipient deleted');
      onDeleted(recipient.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{recipient.name}</CardTitle>
            <CardDescription>{recipient.bankName}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">•••</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Account:</span>{' '}
            <span className="font-mono">{recipient.accountNumber}</span>
          </div>
          {recipient.email && (
            <div>
              <span className="text-muted-foreground">Email:</span> {recipient.email}
            </div>
          )}
          {recipient.phone && (
            <div>
              <span className="text-muted-foreground">Phone:</span> {recipient.phone}
            </div>
          )}
          <div className="pt-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                recipient.verified
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {recipient.verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

