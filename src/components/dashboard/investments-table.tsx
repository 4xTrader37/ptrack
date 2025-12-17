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
import type { Investment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';


interface InvestmentsTableProps {
  investments: Investment[];
}

export function InvestmentsTable({ investments }: InvestmentsTableProps) {
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Investments</CardTitle>
        <CardDescription>A list of recent investments.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investor</TableHead>
              <TableHead>Items Purchased</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.length > 0 ? (
              investments.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="font-medium">{inv.investorName}</div>
                    <div className="text-sm text-muted-foreground">{inv.source}</div>
                  </TableCell>
                  <TableCell>{inv.itemsPurchased}</TableCell>
                   <TableCell>{format(parseISO(inv.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
                        No investments in this period.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Total Investment Amount:{' '}
          <span className="font-bold">{formatCurrency(totalInvestment)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
