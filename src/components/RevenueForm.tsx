import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Car, DollarSign, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  date: string;
  expedition: string;
  packageValue: number;
  individualValue: number;
  guidesCost: number;
  commissionCost: number;
  ferryCost: number;
  coolerCost: number;
  fuelCost: number;
}

const expeditions = [
  { id: "utv25", name: "UTV 25", defaultValue: 2700 },
  { id: "buggy30", name: "Buggy 30", defaultValue: 3200 },
  { id: "quad20", name: "Quadriciclo 20", defaultValue: 2200 },
  { id: "jeep35", name: "Jeep 35", defaultValue: 3800 },
  { id: "trilha15", name: "Trilha 15", defaultValue: 1800 },
];

const RevenueForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    date: "",
    expedition: "",
    packageValue: 0,
    individualValue: 0,
    guidesCost: 350,
    commissionCost: 135,
    ferryCost: 0,
    coolerCost: 45,
    fuelCost: 91.2,
  });

  const [freeRevenue, setFreeRevenue] = useState(0);

  const calculateFreeRevenue = () => {
    const totalCosts = 
      formData.guidesCost + 
      formData.commissionCost + 
      formData.ferryCost + 
      formData.coolerCost + 
      formData.fuelCost;
    
    return formData.individualValue - totalCosts;
  };

  useEffect(() => {
    setFreeRevenue(calculateFreeRevenue());
  }, [formData]);

  const handleExpeditionChange = (expeditionId: string) => {
    const expedition = expeditions.find(exp => exp.id === expeditionId);
    if (expedition) {
      setFormData(prev => ({
        ...prev,
        expedition: expeditionId,
        packageValue: expedition.defaultValue,
        individualValue: expedition.defaultValue,
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.expedition) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Receita Registrada!",
      description: `Receita livre: R$ ${freeRevenue.toFixed(2)}`,
    });

    // Reset form
    setFormData({
      date: "",
      expedition: "",
      packageValue: 0,
      individualValue: 0,
      guidesCost: 350,
      commissionCost: 135,
      ferryCost: 0,
      coolerCost: 45,
      fuelCost: 91.2,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-24 h-24 mx-auto bg-gradient-hero rounded-full flex items-center justify-center shadow-card">
            <Car className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Rumo dos Ventos</h1>
          <p className="text-muted-foreground">Gerenciamento de Receitas</p>
        </div>

        {/* Form Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Nova Receita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full"
              />
            </div>

            {/* Expedition */}
            <div className="space-y-2">
              <Label>Passeio/Expedição</Label>
              <Select value={formData.expedition} onValueChange={handleExpeditionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o passeio" />
                </SelectTrigger>
                <SelectContent>
                  {expeditions.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.name} - R$ {exp.defaultValue.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package Value */}
            <div className="space-y-2">
              <Label htmlFor="packageValue">Valor do Pacote</Label>
              <Input
                id="packageValue"
                type="number"
                step="0.01"
                value={formData.packageValue}
                onChange={(e) => setFormData(prev => ({ ...prev, packageValue: parseFloat(e.target.value) || 0 }))}
                className="w-full"
              />
            </div>

            {/* Individual/Vehicle Value */}
            <div className="space-y-2">
              <Label htmlFor="individualValue">Individual/Veículo</Label>
              <Input
                id="individualValue"
                type="number"
                step="0.01"
                value={formData.individualValue}
                onChange={(e) => setFormData(prev => ({ ...prev, individualValue: parseFloat(e.target.value) || 0 }))}
                className="w-full"
              />
            </div>

            {/* Costs Section */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-medium text-foreground">Custos</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="guidesCost" className="text-xs">Custo Guia</Label>
                  <Input
                    id="guidesCost"
                    type="number"
                    step="0.01"
                    value={formData.guidesCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, guidesCost: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="commissionCost" className="text-xs">Comissão</Label>
                  <Input
                    id="commissionCost"
                    type="number"
                    step="0.01"
                    value={formData.commissionCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, commissionCost: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ferryCost" className="text-xs">Custo Balsa</Label>
                  <Input
                    id="ferryCost"
                    type="number"
                    step="0.01"
                    value={formData.ferryCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, ferryCost: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="coolerCost" className="text-xs">Cooler</Label>
                  <Input
                    id="coolerCost"
                    type="number"
                    step="0.01"
                    value={formData.coolerCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, coolerCost: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fuelCost" className="text-xs">Combustível</Label>
                <Input
                  id="fuelCost"
                  type="number"
                  step="0.01"
                  value={formData.fuelCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuelCost: parseFloat(e.target.value) || 0 }))}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Free Revenue Display */}
            <div className="bg-gradient-hero/10 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <Calculator className="w-4 h-4 text-primary" />
                  Receita Livre
                </span>
                <span className="text-lg font-bold text-primary">
                  R$ {freeRevenue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              variant="hero"
              size="lg"
              className="w-full"
            >
              Registrar Receita
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueForm;