'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateRecipientDialog } from './create-recipient-dialog';
import { RecipientCard } from './recipient-card';
import type { Recipient } from '@/lib/types';

interface RecipientsListProps {
  initialRecipients: Recipient[];
}

export function RecipientsList({ initialRecipients }: RecipientsListProps) {
  const [recipients, setRecipients] = useState(initialRecipients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRecipientCreated = (recipient: Recipient) => {
    setRecipients([recipient, ...recipients]);
    setIsDialogOpen(false);
  };

  const handleRecipientDeleted = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id));
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>Add Recipient</Button>
      </div>

      {recipients.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No recipients</CardTitle>
            <CardDescription>
              Get started by adding your first payment recipient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsDialogOpen(true)}>Add Recipient</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipients.map((recipient) => (
            <RecipientCard
              key={recipient.id}
              recipient={recipient}
              onDeleted={handleRecipientDeleted}
            />
          ))}
        </div>
      )}

      <CreateRecipientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleRecipientCreated}
      />
    </>
  );
}

