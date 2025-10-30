import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailedTransaction } from '@/hooks/useDetailedReports';
import { FileText, Receipt } from 'lucide-react';

interface DetailedTransactionsTableProps {
  transactions: DetailedTransaction[];
  loading: boolean;
}

export const DetailedTransactionsTable: React.FC<DetailedTransactionsTableProps> = ({
  transactions,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions détaillées</CardTitle>
          <CardDescription>Aucune transaction pour cette période</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune transaction à afficher</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions détaillées</CardTitle>
        <CardDescription>
          Toutes les transactions de cette période avec l'heure exacte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>PDV</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.date}</TableCell>
                  <TableCell>{transaction.time}</TableCell>
                  <TableCell>{transaction.outlet_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.type === 'order' ? (
                        <Receipt className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-purple-600" />
                      )}
                      {transaction.type === 'order' ? 'Commande' : 'Facture'}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                  <TableCell>{transaction.customer_name}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {transaction.amount.toLocaleString()} CFA
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={6}>Total</TableCell>
                <TableCell className="text-right text-green-600">
                  {totalAmount.toLocaleString()} CFA
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
