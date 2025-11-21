import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface CalculatorResult {
  breakEven: number;
  profitMargin: number;
  roi: number;
  projectedRevenue: number;
}

export const AccountingCalculator: React.FC = () => {
  const [calculatorType, setCalculatorType] = useState<'breakeven' | 'roi' | 'projection'>('breakeven');
  const [fixedCosts, setFixedCosts] = useState<string>('');
  const [variableCosts, setVariableCosts] = useState<string>('');
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [investment, setInvestment] = useState<string>('');
  const [returns, setReturns] = useState<string>('');
  const [currentMRR, setCurrentMRR] = useState<string>('');
  const [growthRate, setGrowthRate] = useState<string>('');
  const [months, setMonths] = useState<string>('12');
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculateBreakEven = () => {
    const fixed = parseFloat(fixedCosts) || 0;
    const variable = parseFloat(variableCosts) || 0;
    const price = parseFloat(pricePerUnit) || 0;

    if (price <= variable) {
      toast.error('Le prix unitaire doit être supérieur aux coûts variables');
      return;
    }

    const breakEvenUnits = fixed / (price - variable);
    const breakEvenRevenue = breakEvenUnits * price;
    const profitMargin = ((price - variable - (fixed / breakEvenUnits)) / price) * 100;

    setResult({
      breakEven: breakEvenUnits,
      profitMargin,
      roi: 0,
      projectedRevenue: breakEvenRevenue
    });

    toast.success('Calcul effectué avec succès');
  };

  const calculateROI = () => {
    const inv = parseFloat(investment) || 0;
    const ret = parseFloat(returns) || 0;

    if (inv === 0) {
      toast.error('L\'investissement ne peut pas être zéro');
      return;
    }

    const roi = ((ret - inv) / inv) * 100;
    const profitMargin = ((ret - inv) / ret) * 100;

    setResult({
      breakEven: 0,
      profitMargin,
      roi,
      projectedRevenue: ret
    });

    toast.success('Calcul effectué avec succès');
  };

  const calculateProjection = () => {
    const mrr = parseFloat(currentMRR) || 0;
    const growth = parseFloat(growthRate) || 0;
    const m = parseInt(months) || 12;

    let projectedRevenue = mrr;
    for (let i = 0; i < m; i++) {
      projectedRevenue = projectedRevenue * (1 + growth / 100);
    }

    const totalRevenue = projectedRevenue * m;
    const totalGrowth = ((projectedRevenue - mrr) / mrr) * 100;

    setResult({
      breakEven: 0,
      profitMargin: 0,
      roi: totalGrowth,
      projectedRevenue: totalRevenue
    });

    toast.success('Projection calculée avec succès');
  };

  const handleCalculate = () => {
    switch (calculatorType) {
      case 'breakeven':
        calculateBreakEven();
        break;
      case 'roi':
        calculateROI();
        break;
      case 'projection':
        calculateProjection();
        break;
    }
  };

  const resetCalculator = () => {
    setFixedCosts('');
    setVariableCosts('');
    setPricePerUnit('');
    setInvestment('');
    setReturns('');
    setCurrentMRR('');
    setGrowthRate('');
    setMonths('12');
    setResult(null);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculateur Financier
        </CardTitle>
        <CardDescription>Calculez votre seuil de rentabilité, ROI et projections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Type de calcul</Label>
          <Select value={calculatorType} onValueChange={(v: any) => { setCalculatorType(v); resetCalculator(); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakeven">Seuil de Rentabilité</SelectItem>
              <SelectItem value="roi">Retour sur Investissement (ROI)</SelectItem>
              <SelectItem value="projection">Projection de Revenus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {calculatorType === 'breakeven' && (
          <div className="space-y-4">
            <div>
              <Label>Coûts Fixes (FCFA)</Label>
              <Input
                type="number"
                placeholder="Ex: 500000"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(e.target.value)}
              />
            </div>
            <div>
              <Label>Coûts Variables par Unité (FCFA)</Label>
              <Input
                type="number"
                placeholder="Ex: 1000"
                value={variableCosts}
                onChange={(e) => setVariableCosts(e.target.value)}
              />
            </div>
            <div>
              <Label>Prix de Vente par Unité (FCFA)</Label>
              <Input
                type="number"
                placeholder="Ex: 5000"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
              />
            </div>
          </div>
        )}

        {calculatorType === 'roi' && (
          <div className="space-y-4">
            <div>
              <Label>Investissement Initial (FCFA)</Label>
              <Input
                type="number"
                placeholder="Ex: 1000000"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
              />
            </div>
            <div>
              <Label>Retour Total (FCFA)</Label>
              <Input
                type="number"
                placeholder="Ex: 1500000"
                value={returns}
                onChange={(e) => setReturns(e.target.value)}
              />
            </div>
          </div>
        )}

        {calculatorType === 'projection' && (
          <div className="space-y-4">
            <div>
              <Label>MRR Actuel (FCFA)</Label>
              <Input
                type="number"
                placeholder="Ex: 5000000"
                value={currentMRR}
                onChange={(e) => setCurrentMRR(e.target.value)}
              />
            </div>
            <div>
              <Label>Taux de Croissance Mensuel (%)</Label>
              <Input
                type="number"
                placeholder="Ex: 5"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
              />
            </div>
            <div>
              <Label>Nombre de Mois</Label>
              <Input
                type="number"
                placeholder="12"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleCalculate} className="flex-1">
            <Calculator className="w-4 h-4 mr-2" />
            Calculer
          </Button>
          <Button onClick={resetCalculator} variant="outline">
            Réinitialiser
          </Button>
        </div>

        {result && (
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Résultats
            </h3>
            
            {calculatorType === 'breakeven' && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Seuil de Rentabilité</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.breakEven.toFixed(0)} unités
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Revenu au Seuil</p>
                  <p className="text-xl font-bold">
                    {result.projectedRevenue.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Marge Bénéficiaire</p>
                  <p className="text-xl font-bold text-green-600">
                    {result.profitMargin.toFixed(2)}%
                  </p>
                </div>
              </>
            )}

            {calculatorType === 'roi' && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className={`text-2xl font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.roi >= 0 ? <TrendingUp className="inline w-5 h-5 mr-1" /> : <TrendingDown className="inline w-5 h-5 mr-1" />}
                    {result.roi.toFixed(2)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Profit Net</p>
                  <p className={`text-xl font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(result.projectedRevenue - parseFloat(investment)).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </>
            )}

            {calculatorType === 'projection' && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Revenu Projeté ({months} mois)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {result.projectedRevenue.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Croissance Totale</p>
                  <p className="text-xl font-bold text-blue-600">
                    <TrendingUp className="inline w-5 h-5 mr-1" />
                    {result.roi.toFixed(2)}%
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
