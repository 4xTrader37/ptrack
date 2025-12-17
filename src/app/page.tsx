'use client';

import * as React from 'react';
import Link from 'next/link';
import { addDays, startOfToday, subDays, startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAppContext } from '@/context/app-context';
import type { Sale, Investment } from '@/lib/types';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesTable } from '@/components/dashboard/sales-table';
import { InvestmentsTable } from '@/components/dashboard/investments-table';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { sales, investments, products } = useAppContext();
  const [tab, setTab] = React.useState('7days');
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(startOfToday(), 6),
    to: startOfToday(),
  });

  const handleTabChange = (value: string) => {
    setTab(value);
    switch (value) {
      case 'today':
        setDate({ from: startOfToday(), to: startOfToday() });
        break;
      case '7days':
        setDate({ from: subDays(startOfToday(), 6), to: startOfToday() });
        break;
      case '30days':
        setDate({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
        break;
      case 'custom':
        setDate(undefined);
        break;
      default:
        setDate({ from: subDays(startOfToday(), 6), to: startOfToday() });
    }
  };

  const filteredSales = React.useMemo(() => {
    if (!date?.from) return [];
    const fromDate = date.from;
    const toDate = date.to || date.from;
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= fromDate && saleDate <= addDays(toDate,1);
    });
  }, [sales, date]);

  const filteredInvestments = React.useMemo(() => {
    if (!date?.from) return [];
    const fromDate = date.from;
    const toDate = date.to || date.from;
    return investments.filter((investment) => {
      const investmentDate = new Date(investment.date);
      return investmentDate >= fromDate && investmentDate <= addDays(toDate,1);
    });
  }, [investments, date]);

  const { totalSales, totalInvestment, profitOrLoss, profitLossRatio, totalEarned } = React.useMemo(() => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalInvestment = filteredInvestments.reduce((sum, investment) => sum + investment.amount, 0);
    const profitOrLoss = totalSales - totalInvestment;
    const profitLossRatio = totalInvestment > 0 ? (profitOrLoss / totalInvestment) * 100 : (totalSales > 0 ? 100 : 0);
    const totalEarned = filteredSales.filter(s => s.paymentStatus === 'Paid').reduce((sum, sale) => sum + sale.totalPrice, 0);

    return { totalSales, totalInvestment, profitOrLoss, profitLossRatio, totalEarned };
  }, [filteredSales, filteredInvestments]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Overview
        </h1>
        <div className="flex items-center space-x-2">
          <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30days">Last Month</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
          {tab === 'custom' && <DateRangePicker date={date} setDate={setDate} />}
        </div>
      </div>
      <StatsCards
        totalSales={totalSales}
        totalInvestment={totalInvestment}
        profitOrLoss={profitOrLoss}
        profitLossRatio={profitLossRatio}
        historicalSales={sales}
        historicalInvestments={investments}
      />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <SalesTable sales={filteredSales} totalEarned={totalEarned} />
        <InvestmentsTable investments={filteredInvestments} />
      </div>
      <div className="flex justify-center mt-8">
        <Button asChild variant="outline">
          <Link href="/admin">
            Go to Admin Page <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
