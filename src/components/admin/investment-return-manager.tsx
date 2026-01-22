'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
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
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const investmentReturnSchema = z.object({
  investmentId: z.string().min(1, 'Please select an investment to return'),
});

export function InvestmentReturnManager() {
  const { investments, investmentReturns, giveBackInvestment } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof investmentReturnSchema>>({
    resolver: zodResolver(investmentReturnSchema),
    defaultValues: {
      investmentId: '',
    },
  });

  function onSubmit(values: z.infer<typeof investmentReturnSchema>) {
    giveBackInvestment(values.investmentId);
    form.reset();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Give Back Investment</CardTitle>
          <CardDescription>
            Select an investment to mark as fully returned. This will move it to the return history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="investmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment to Return</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an active investment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {investments && investments.map((investment) => (
                            <SelectItem key={investment.id} value={investment.id}>
                              {`${investment.investorName} - ${formatCurrency(investment.amount)} on ${format(parseISO(investment.date), 'dd/MM/yy')}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Return Full Investment</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Investment Return History</CardTitle>
          <CardDescription>
            A list of all past investment returns.
          </CardDescription>
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
              {investmentReturns && investmentReturns.map((ir) => (
                <TableRow key={ir.id}>
                  <TableCell className="font-medium">{ir.investorName}</TableCell>
                  <TableCell>{ir.description || '-'}</TableCell>
                  <TableCell>{format(parseISO(ir.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ir.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
