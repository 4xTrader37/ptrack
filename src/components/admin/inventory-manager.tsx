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
  CardFooter
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
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  costPrice: z.coerce.number().min(0, 'Cost price must be non-negative'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be non-negative'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be a non-negative integer'),
});

export function InventoryManager() {
  const { products, addProduct, getInventoryValue } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      costPrice: 0,
      sellingPrice: 0,
      quantity: 0,
    },
  });

  function onSubmit(values: z.infer<typeof productSchema>) {
    addProduct(values);
    toast({
        title: "Product Added",
        description: `${values.name} has been added to the inventory.`,
      });
    form.reset();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Add New Product</CardTitle>
          <CardDescription>
            Fill in the details to add a new perfume to your inventory.
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
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mystic Oud" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Price (₨)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (₨)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Add Product</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Current Inventory</CardTitle>
          <CardDescription>
            A list of all products currently in stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.sellingPrice)}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end">
            <div className="text-right">
                <p className="font-bold text-lg">Total Inventory Value</p>
                <p className="text-2xl font-bold">{formatCurrency(getInventoryValue())}</p>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
