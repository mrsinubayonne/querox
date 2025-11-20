import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailedTransaction } from '@/hooks/useDetailedReports';
import { FileText, Receipt, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DetailedTransactionsTableProps {
  transactions: DetailedTransaction[];
  loading: boolean;
}

export const DetailedTransactionsTable: React.FC<DetailedTransactionsTableProps> = ({
  transactions,
  loading,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
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
                <TableHead className="w-[50px]"></TableHead>
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
              {transactions.map((transaction) => {
                const isExpanded = expandedRows.has(transaction.id);
                return (
                  <React.Fragment key={transaction.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRow(transaction.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
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
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/50 p-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm mb-3">Détail des articles :</h4>
                            {transaction.items && Array.isArray(transaction.items) && transaction.items.length > 0 ? (
                              <div className="grid gap-2">
                                {transaction.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center bg-background p-3 rounded-lg border">
                                    <div className="flex-1">
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-muted-foreground">Quantité : {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} CFA</p>
                                      <p className="text-sm text-muted-foreground">{item.price.toLocaleString()} CFA × {item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Aucun article disponible</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={7}>Total</TableCell>
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
