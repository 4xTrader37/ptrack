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
import type { InvestmentReturn } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';


interface InvestmentReturnsTableProps {
  investmentReturns: InvestmentReturn[];
}

export function InvestmentReturnsTable({ investmentReturns }: InvestmentReturnsTableProps) {
    const totalReturned = investmentReturns.reduce((sum, ir) => sum + ir.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Investment Return History</CardTitle>
        <CardDescription>A list of investments returned to investors.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investor</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investmentReturns.length > 0 ? (
              investmentReturns.map((ir) => (
                <TableRow key={ir.id}>
                  <TableCell>
                    <div className="font-medium">{ir.investorName}</div>
                  </TableCell>
                  <TableCell>{ir.description}</TableCell>
                   <TableCell>{format(parseISO(ir.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(ir.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
                        No investment returns in this period.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Total Amount Returned:{' '}
          <span className="font-bold">{formatCurrency(totalReturned)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
