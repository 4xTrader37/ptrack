'use server';

import { profitLossForecasting } from '@/ai/flows/profit-loss-forecasting';
import type { Investment, Sale } from '@/lib/types';

export async function getProfitLossForecast(
    forecastPeriod: string,
    marketTrends: string,
    perfumeDemand: string,
    salesData: Sale[],
    investmentData: Investment[]
) {
    try {
        const result = await profitLossForecasting({
            forecastPeriod,
            marketTrends,
            perfumeDemand,
            historicalSalesData: JSON.stringify(salesData),
            historicalInvestmentData: JSON.stringify(investmentData),
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in AI forecast flow:", error);
        return { success: false, error: 'Failed to generate forecast.' };
    }
}
