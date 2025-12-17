'use server';

/**
 * @fileOverview This file contains a Genkit flow for forecasting profit and loss based on historical data.
 *
 * The flow uses historical sales and investment data to predict future profitability,
 * aiding in making informed decisions about inventory purchasing and investment strategies.
 *
 * @flow profitLossForecasting - The main function to initiate profit and loss forecasting.
 * @type {ProfitLossForecastingInput} ProfitLossForecastingInput - The input type for the profitLossForecasting function.
 * @type {ProfitLossForecastingOutput} ProfitLossForecastingOutput - The output type for the profitLossForecasting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfitLossForecastingInputSchema = z.object({
  historicalSalesData: z.string().describe('Historical sales data in JSON format.'),
  historicalInvestmentData: z.string().describe('Historical investment data in JSON format.'),
  marketTrends: z.string().optional().describe('Optional market trends data.'),
  perfumeDemand: z.string().optional().describe('Optional perfume demand data.'),
  forecastPeriod: z.string().describe('The period for which to forecast (e.g., next month, next quarter).'),
});
export type ProfitLossForecastingInput = z.infer<typeof ProfitLossForecastingInputSchema>;

const ProfitLossForecastingOutputSchema = z.object({
  forecastReport: z.string().describe('A detailed report forecasting profit and loss for the specified period.'),
});
export type ProfitLossForecastingOutput = z.infer<typeof ProfitLossForecastingOutputSchema>;

export async function profitLossForecasting(input: ProfitLossForecastingInput): Promise<ProfitLossForecastingOutput> {
  return profitLossForecastingFlow(input);
}

const profitLossForecastingPrompt = ai.definePrompt({
  name: 'profitLossForecastingPrompt',
  input: {schema: ProfitLossForecastingInputSchema},
  output: {schema: ProfitLossForecastingOutputSchema},
  prompt: `You are an expert financial analyst specializing in forecasting profit and loss for perfume-based businesses.
  Based on the historical sales data, historical investment data, market trends, and perfume demand, generate a detailed forecast report for the specified period.

  Historical Sales Data: {{{historicalSalesData}}}
  Historical Investment Data: {{{historicalInvestmentData}}}
  Market Trends: {{{marketTrends}}}
  Perfume Demand: {{{perfumeDemand}}}
  Forecast Period: {{{forecastPeriod}}}

  Generate a comprehensive report including projected sales, expenses, profit, loss, and key influencing factors.
  Consider market sales trends and perfumery demand to refine the forecast.
  The report must be clear, concise, and actionable, providing insights for inventory purchasing and investment strategies.
`,
});

const profitLossForecastingFlow = ai.defineFlow(
  {
    name: 'profitLossForecastingFlow',
    inputSchema: ProfitLossForecastingInputSchema,
    outputSchema: ProfitLossForecastingOutputSchema,
  },
  async input => {
    const {output} = await profitLossForecastingPrompt(input);
    return output!;
  }
);
