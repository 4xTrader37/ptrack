'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { InventoryManager } from '@/components/admin/inventory-manager';
import { SalesManager } from '@/components/admin/sales-manager';
import { InvestmentManager } from '@/components/admin/investment-manager';

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold">Admin Panel</h1>
      </div>
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="space-y-4">
          <InventoryManager />
        </TabsContent>
        <TabsContent value="sales" className="space-y-4">
          <SalesManager />
        </TabsContent>
        <TabsContent value="investments" className="space-y-4">
          <InvestmentManager />
        </TabsContent>
      </Tabs>
    </main>
  );
}
