'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2 } from 'lucide-react';
import type { Investment, Sale } from '@/lib/types';
import { getProfitLossForecast } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ForecastDialogProps {
    sales: Sale[];
    investments: Investment[];
}

export function ForecastDialog({ sales, investments }: ForecastDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    
    const [forecastPeriod, setForecastPeriod] = useState('next quarter');
    const [marketTrends, setMarketTrends] = useState('');
    const [perfumeDemand, setPerfumeDemand] = useState('');

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        const response = await getProfitLossForecast(
            forecastPeriod,
            marketTrends,
            perfumeDemand,
            sales,
            investments
        );

        if (response.success) {
            setResult(response.data.forecastReport);
        } else {
            setError(response.error);
        }

        setIsLoading(false);
    };

    const resetDialog = () => {
        setIsOpen(false);
        setIsLoading(false);
        setError(null);
        setResult(null);
        setMarketTrends('');
        setPerfumeDemand('');
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4 w-full">
          <Wand2 className="mr-2 h-4 w-4" />
          Profit/Loss Forecasting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Profit/Loss Forecast</DialogTitle>
          <DialogDescription>
            Use AI to forecast future profitability based on historical data.
          </DialogDescription>
        </DialogHeader>
        
        {!result && !isLoading && (
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="forecast-period" className="text-right">
                        Period
                    </Label>
                    <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                        <SelectTrigger id="forecast-period" className="col-span-3">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="next month">Next Month</SelectItem>
                            <SelectItem value="next quarter">Next Quarter</SelectItem>
                            <SelectItem value="next 6 months">Next 6 Months</SelectItem>
                            <SelectItem value="next year">Next Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="market-trends" className="text-right pt-2">
                        Market Trends
                    </Label>
                    <Textarea 
                        id="market-trends"
                        value={marketTrends}
                        onChange={(e) => setMarketTrends(e.target.value)}
                        placeholder="Optional: e.g., 'Rising demand for floral scents'" 
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="perfume-demand" className="text-right pt-2">
                        Perfume Demand
                    </Label>
                    <Textarea 
                        id="perfume-demand"
                        value={perfumeDemand}
                        onChange={(e) => setPerfumeDemand(e.target.value)}
                        placeholder="Optional: e.g., 'High demand for oud in winter'" 
                        className="col-span-3"
                    />
                </div>
            </div>
        )}

        {isLoading && (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-4">Generating forecast...</span>
            </div>
        )}
        
        {error && (
             <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {result && (
            <div className="prose prose-sm dark:prose-invert max-h-[400px] overflow-y-auto rounded-md border bg-secondary/30 p-4">
                <h3 className="font-headline">Forecast Report</h3>
                <p>{result}</p>
            </div>
        )}

        <DialogFooter>
            {result ? (
                <Button onClick={resetDialog}>Close</Button>
            ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate Forecast
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
