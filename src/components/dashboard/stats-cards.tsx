'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Landmark, Package, Archive } from 'lucide-react';
import type { Investment, Sale } from '@/lib/types';
import { ForecastDialog } from './forecast-dialog';

interface StatsCardsProps {
  totalSales: number;
  totalInvestment: number;
  profitOrLoss: number;
  profitLossRatio: number;
  historicalSales: Sale[];
  historicalInvestments: Investment[];
  totalInventoryValue: number;
  totalInventoryItems: number;
}

export function StatsCards({
  totalSales,
  totalInvestment,
  profitOrLoss,
  profitLossRatio,
  historicalSales,
  historicalInvestments,
  totalInventoryValue,
  totalInventoryItems,
}: StatsCardsProps) {
  const isProfit = profitOrLoss >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          <p className="text-xs text-muted-foreground">
            Total revenue from sales in selected period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          <p className="text-xs text-muted-foreground">
            Total investment in selected period
          </p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
          <p className="text-xs text-muted-foreground">
            Total value of all items in stock
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInventoryItems}</div>
          <p className="text-xs text-muted-foreground">
            Total number of all items in stock
          </p>
        </CardContent>
      </Card>
      <Card className={isProfit ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isProfit ? 'Profit' : 'Loss'}
          </CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {formatCurrency(profitOrLoss)}
          </div>
          <p className={`text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {isProfit ? '+' : ''}{profitLossRatio.toFixed(2)}% profit/loss ratio
          </p>
          <ForecastDialog sales={historicalSales} investments={historicalInvestments} />
        </CardContent>
      </Card>
    </div>
  );
}
