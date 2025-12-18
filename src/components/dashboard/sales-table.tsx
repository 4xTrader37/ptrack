import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Sale } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface SalesTableProps {
  sales: Sale[];
  totalEarned: number;
}

export function SalesTable({ sales, totalEarned }: SalesTableProps) {
  const getBadgeVariant = (status: Sale['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Unpaid':
        return 'destructive';
      case 'Remaining':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Sales</CardTitle>
        <CardDescription>A list of recent sales.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length > 0 ? (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.customerName}</div>
                  </TableCell>
                  <TableCell>
                    {sale.items.map(item => `${item.name} (x${item.quantity}) @ ${formatCurrency(item.price)}`).join(', ')}
                  </TableCell>
                  <TableCell>{format(parseISO(sale.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(sale.paymentStatus)}>{sale.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.totalPrice)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No sales in this period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Total Sales Count</div>
          <div className="font-bold">{sales.length}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground text-right">Total Earned</div>
           <div className="font-bold text-right">{formatCurrency(totalEarned)}</div>
        </div>
      </CardFooter>
    </Card>
  );
}
