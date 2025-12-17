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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

const investmentSchema = z.object({
  investorName: z.string().min(1, 'Investor name is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  source: z.enum(['External Investor', 'Business Self-Investment']),
  itemsPurchased: z.string().min(1, 'This field is required'),
});

export function InvestmentManager() {
  const { investments, addInvestment } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      investorName: '',
      amount: 0,
      source: 'External Investor',
      itemsPurchased: '',
    },
  });

  function onSubmit(values: z.infer<typeof investmentSchema>) {
    addInvestment(values);
    toast({
        title: "Investment Added",
        description: `Investment from ${values.investorName} has been recorded.`,
      });
    form.reset();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Add New Investment</CardTitle>
          <CardDescription>
            Log any capital added to the business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="investorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Yasir Malik or Self" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Amount (₨)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Investment Source</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="External Investor" />
                          </FormControl>
                          <FormLabel className="font-normal">External Investor</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Business Self-Investment" />
                          </FormControl>
                          <FormLabel className="font-normal">Business Self-Investment</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="itemsPurchased"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item(s) Purchased</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Raw materials, bottles" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Add Investment</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Investment History</CardTitle>
          <CardDescription>
            A list of all past investments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.investorName}</TableCell>
                  <TableCell>{inv.source}</TableCell>
                  <TableCell>{format(parseISO(inv.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(inv.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
