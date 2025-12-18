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
import type { Investor } from '@/lib/types';
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

const investorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Investor name is required'),
});

export function InvestorManager() {
  const { investors, addInvestor, updateInvestor, deleteInvestor } = useAppContext();
  const { toast } = useToast();
  const [isEdit, setIsEdit] = useState(false);

  const form = useForm<z.infer<typeof investorSchema>>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof investorSchema>) {
    if (isEdit && values.id) {
      updateInvestor(values.id, values);
      toast({
        title: "Investor Updated",
        description: `${values.name} has been updated.`,
      });
    } else {
      addInvestor(values);
      toast({
        title: "Investor Added",
        description: `${values.name} has been added.`,
      });
    }
    form.reset({ name: ''});
    setIsEdit(false);
  }

  const handleEditClick = (investor: Investor) => {
    setIsEdit(true);
    form.reset(investor);
  }

  const handleDeleteClick = (investorId: string) => {
    deleteInvestor(investorId);
    toast({
      title: 'Investor Deleted',
      description: 'The investor has been deleted.',
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
          <CardTitle className="font-headline">{isEdit ? 'Edit Investor' : 'Add New Investor'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Update the details of the existing investor.' : 'Add a new investor to your records.'}
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
                    <FormLabel>Investor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Yasir Malik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit">{isEdit ? 'Update Investor' : 'Add Investor'}</Button>
                {isEdit && <Button variant="outline" onClick={handleAddNewClick}>Cancel</Button>}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Investors</CardTitle>
          <CardDescription>
            A list of all your investors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investors && investors.map((investor) => (
                <TableRow key={investor.id}>
                  <TableCell className="font-medium">{investor.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(investor)}>
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
                            This action cannot be undone. This will permanently delete the investor.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={() => handleDeleteClick(investor.id)}>Delete</Button>
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
