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
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Customer } from '@/lib/types';
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

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Customer name is required'),
});

export function CustomerManager() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
  const { toast } = useToast();
  const [isEdit, setIsEdit] = useState(false);

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof customerSchema>) {
    if (isEdit && values.id) {
      updateCustomer(values.id, values);
      toast({
        title: "Customer Updated",
        description: `${values.name} has been updated.`,
      });
    } else {
      addCustomer(values);
      toast({
        title: "Customer Added",
        description: `${values.name} has been added.`,
      });
    }
    form.reset({ name: ''});
    setIsEdit(false);
  }

  const handleEditClick = (customer: Customer) => {
    setIsEdit(true);
    form.reset(customer);
  }

  const handleDeleteClick = (customerId: string) => {
    deleteCustomer(customerId);
    toast({
      title: 'Customer Deleted',
      description: 'The customer has been deleted.',
      variant: 'destructive'
    });
  }

  const handleAddNewClick = () => {
    setIsEdit(false);
    form.reset({
      name: '',
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{isEdit ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Update the details of the existing customer.' : 'Add a new customer to your records.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ahmed Khan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit">{isEdit ? 'Update Customer' : 'Add Customer'}</Button>
                {isEdit && <Button variant="outline" onClick={handleAddNewClick}>Cancel</Button>}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Customers</CardTitle>
          <CardDescription>
            A list of all your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers && customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(customer)}>
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
                            This action cannot be undone. This will permanently delete the customer.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={() => handleDeleteClick(customer.id)}>Delete</Button>
                            </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
