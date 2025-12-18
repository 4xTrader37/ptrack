'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import type { Sale } from '@/lib/types';
import { format, parse, parseISO, formatISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import React from 'react';


const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
});

const salesSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  paymentStatus: z.enum(['Paid', 'Unpaid', 'Remaining']),
  remainingAmount: z.coerce.number().optional(),
  description: z.string().optional(),
  reminderDate: z.string().optional(),
});

function getBadgeVariant(status: Sale['paymentStatus']) {
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

export function SalesManager() {
  const { products, sales, addSale, updateSale, deleteSale, customers } = useAppContext();
  const { toast } = useToast();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const form = useForm<z.infer<typeof salesSchema>>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      customerName: '',
      items: [{ productId: '', quantity: 1, price: 0 }],
      paymentStatus: 'Paid',
      remainingAmount: 0,
      description: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchPaymentStatus = form.watch('paymentStatus');

  function onSubmit(values: z.infer<typeof salesSchema>) {
    const saleData = {
        ...values,
        reminderDate: values.reminderDate ? formatISO(parse(values.reminderDate, 'dd/MM/yyyy', new Date())) : undefined,
    }

    if (isEdit && values.id) {
        updateSale(values.id, saleData);
        toast({
            title: "Sale Updated",
            description: `Sale for ${values.customerName} has been updated.`,
        });
    } else {
        addSale(saleData);
        toast({
            title: "Sale Recorded",
            description: `A new sale for ${values.customerName} has been recorded.`,
        });
    }
    form.reset({
        customerName: '',
        items: [{ productId: '', quantity: 1, price: 0 }],
        paymentStatus: 'Paid',
        description: '',
        remainingAmount: 0
    });
    setIsEdit(false);
    setIsDialogOpen(false);
  }

  const handleAddNewClick = () => {
    setIsEdit(false);
    form.reset({
      customerName: '',
      items: [{ productId: '', quantity: 1, price: 0 }],
      paymentStatus: 'Paid',
      remainingAmount: 0,
      description: '',
      reminderDate: undefined,
    });
    setIsDialogOpen(true);
  }

  const handleEditClick = (sale: Sale) => {
    setIsEdit(true);
    form.reset({
        ...sale,
        items: sale.items.map(i => ({productId: i.productId, quantity: i.quantity, price: i.price })),
        reminderDate: sale.reminderDate ? format(parseISO(sale.reminderDate), 'dd/MM/yyyy') : undefined,
    });
    setIsDialogOpen(true);
  }

  const handleDeleteClick = (saleId: string) => {
    deleteSale(saleId);
    toast({
      title: 'Sale Deleted',
      description: 'The sale has been deleted.',
      variant: 'destructive'
    });
  }

  return (
    <div className="space-y-4">
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEdit ? 'Edit Sale' : 'Add New Sale'}</DialogTitle>
          <DialogDescription>
          {isEdit ? 'Update the details of the existing sale.' : 'Record a new transaction. Inventory will be updated automatically.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className='space-y-6'>
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Ahmed Khan" {...field} list="customer-list" />
                              </FormControl>
                              <datalist id="customer-list">
                                {customers && customers.map(c => <option key={c.id} value={c.name} />)}
                              </datalist>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                        <FormLabel>Items</FormLabel>
                        <div className="space-y-4 mt-2">
                            {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-2">
                                <FormField
                                control={form.control}
                                name={`items.${index}.productId`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            const product = products?.find(p => p.id === value);
                                            if (product) {
                                                form.setValue(`items.${index}.price`, product.sellingPrice);
                                            }
                                        }} 
                                        defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a perfume" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {products && products.map((p) => (
                                            <SelectItem key={p.id} value={p.id} disabled={p.quantity <= 0}>
                                            {p.name} (Stock: {p.quantity})
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name={`items.${index}.price`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Sold At</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Price" className="w-28" {...field} />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Qty</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Qty" className="w-20" {...field} />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                                <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 1}
                                >
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append({ productId: '', quantity: 1, price: 0 })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                        </div>
                    </div>

                    <div className='space-y-6'>
                        <FormField
                        control={form.control}
                        name="paymentStatus"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Payment Status</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex items-center space-x-4"
                                >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Paid" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Paid</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Unpaid" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Unpaid</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Remaining" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Remaining</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        
                        {watchPaymentStatus === 'Remaining' && (
                            <FormField
                            control={form.control}
                            name="remainingAmount"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Remaining Amount (₨)</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="e.g., 500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        )}

                        {(watchPaymentStatus === 'Unpaid' || watchPaymentStatus === 'Remaining') && (
                             <FormField
                                control={form.control}
                                name="reminderDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reminder Date</FormLabel>
                                    <FormControl>
                                      <Input placeholder="dd/mm/yyyy" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                        )}

                        <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., special instructions" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">{isEdit ? 'Update Sale' : 'Record Sale'}</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>


    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline">Sales History</CardTitle>
            <CardDescription>
            A list of all recorded sales.
            </CardDescription>
        </div>
        <Button onClick={handleAddNewClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Sale
        </Button>
      </CardHeader>
      <CardContent>
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reminder</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales && sales.length > 0 ? (
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
                   <TableCell>
                    {sale.reminderDate ? format(parseISO(sale.reminderDate), 'dd MMM yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.totalPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(sale)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                           <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete the sale record.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={() => handleDeleteClick(sale.id)}>Delete</Button>
                            </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No sales recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
