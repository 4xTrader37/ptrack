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
import { Input } from '@/components/ui/input';
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
import { Textarea } from '../ui/textarea';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const investmentReturnSchema = z.object({
  investorId: z.string().min(1, 'Investor is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

export function InvestmentReturnManager() {
  const { investors, investmentReturns, addInvestmentReturn } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof investmentReturnSchema>>({
    resolver: zodResolver(investmentReturnSchema),
    defaultValues: {
      investorId: '',
      amount: 0,
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof investmentReturnSchema>) {
    addInvestmentReturn(values);
    const investor = investors?.find(i => i.id === values.investorId);
    toast({
        title: "Investment Return Recorded",
        description: `Return to ${investor?.name} has been recorded.`,
      });
    form.reset();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Give Back Investment</CardTitle>
          <CardDescription>
            Record an amount returned to an investor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="investorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an investor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {investors && investors.map((investor) => (
                            <SelectItem key={investor.id} value={investor.id}>
                              {investor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Returned (₨)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Partial return of initial investment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Record Return</Button>
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
