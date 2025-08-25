import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  date: string;
  expedition: string;
  seller: string;
  packageValue: number;
  idVehicle: string;
  clientName: string;
  guidesCost: number;
  commissionCost: number;
  ferryCost: number;
  coolerCost: number;
  fuelCost: number;
  externalSeller: string;
  observation: string;
}

const sellers = [
  { id: "Rosinha", name: "Rosinha" },
  { id: "Izaias", name: "Izaias" }
];

const expeditions = [
  { id: "utv2LLeste", name: "UTV 2L - Leste", defaultValue: 450 },
  { id: "utv2LOeste", name: "UTV 2L - Oeste", defaultValue: 450 },
  { id: "utv2LExtremoOeste", name: "UTV 2L - Extremo Oeste", defaultValue: 600 },
  { id: "utv2LLestePorSol", name: "UTV 2L - Leste C/ Pôr Do Sol Barrinha", defaultValue: 600 },
  { id: "utv2L2h", name: "UTV 2L - 2 Horas / 2", defaultValue: 1650 },
  { id: "utv4L2h", name: "UTV 4L - 2 Horas / 4", defaultValue: 1850 },
  { id: "utv2L5h", name: "UTV 2L - 5 Horas / 2", defaultValue: 2200 },
  { id: "utv4L5h", name: "UTV 4L - 5 Horas / 4", defaultValue: 2800 },
  { id: "utv2LDunaFunil", name: "UTV 2L - Duna do Funil", defaultValue: 2600 },
  { id: "utv4LDunaFunil", name: "UTV 4L - Duna do Funil", defaultValue: 2900 },
  { id: "utv2LIlhaAmor", name: "UTV 2L - Ilha do Amor", defaultValue: 2900 },
  { id: "utv4LIlhaAmor", name: "UTV 4L - Ilha do Amor", defaultValue: 3200 },
  { id: "utv2LLestePorSolExt", name: "UTV 2L - Leste C/ Pôr Do Sol Barrinha", defaultValue: 2600 },
  { id: "utv4LLestePorSolExt", name: "UTV 4L - Leste C/ Pôr Do Sol Barrinha", defaultValue: 2900 }
];

const RevenueForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    date: "",
    seller: "",
    expedition: "",
    packageValue: 0,
    clientName: "",
    guidesCost: 0,
    commissionCost: 0,
    ferryCost: 0,
    coolerCost: 0,
    fuelCost: 0,
    externalSeller: "",
    idVehicle: "",
    observation: ""
  });

  const [freeRevenue, setFreeRevenue] = useState(0);

  const calculateFreeRevenue = () => {
    const totalCosts =
      formData.guidesCost +
      formData.commissionCost +
      formData.ferryCost +
      formData.coolerCost +
      formData.fuelCost;

    return formData.packageValue - totalCosts;
  };

  useEffect(() => {
    setFreeRevenue(calculateFreeRevenue());
  }, [formData]);

  const handleSellerChange = (sellerId: string) => {
    setFormData(prev => ({
      ...prev,
      seller: sellerId
    }));
  };

  const handleExpeditionChange = (expeditionId: string) => {
    const expedition = expeditions.find(exp => exp.id === expeditionId);
    if (expedition) {
      setFormData(prev => ({
        ...prev,
        expedition: expeditionId,
        packageValue: expedition.defaultValue
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.expedition) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      ...formData,
      receitaLivre: freeRevenue
    };

    try {
      const response = await fetch("https://ron8n.myrvm.com.br/webhook/entrada-receita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Erro ao enviar para o N8N");

      toast({
        title: "Receita Registrada!",
        description: `Receita livre: R$ ${freeRevenue.toFixed(2)}`
      });

      setFormData({
        date: "",
        expedition: "",
        seller: "",
        packageValue: 0,
        clientName: "",
        guidesCost: 0,
        commissionCost: 0,
        ferryCost: 0,
        coolerCost: 0,
        fuelCost: 0,
        externalSeller: "",
        idVehicle: "",
        observation: ""
      });
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast({
        title: "Erro ao enviar",
        description: "Verifique sua conexão ou o endpoint do N8N.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Rumo dos Ventos
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
                max={new Date().toISOString().split("T")[0]} 
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full"
              />
            </div>

            {/* Vendedor */}
            <div className="space-y-2">
              <Label>Vendedor</Label>
              <Select value={formData.seller} onValueChange={handleSellerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vendedor Externo */}
            <div className="space-y-2">
              <Label>Vendedor Externo</Label>
              <Input
                id="nomeVendedorExterno"
                type="text"
                className="w-full"
                value={formData.externalSeller}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    externalSeller: e.target.value
                  }))
                }
              />
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <Label>Nome do Cliente</Label>
              <Input
                id="clientName"
                type="text"
                className="w-full"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    clientName: e.target.value
                  }))
                }
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

            {/* Id Vehicle */}
            <div className="space-y-2">
              <Label>Número do Veículo</Label>
              <Input
                id="idVeiculo"
                type="text"
                className="w-full"
                value={formData.idVehicle}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    idVehicle: e.target.value
                  }))
                }
              />
            </div>
            
            {/* Package Value */}
            <div className="space-y-2">
              <Label htmlFor="packageValue">Valor do Pacote</Label>
              <Input
                id="packageValue"
                type="number"
                placeholder="0"
                step="1"
                value={formData.packageValue}
                onChange={(e) => setFormData(prev => ({ ...prev, packageValue: parseFloat(e.target.value) || 0 }))}
                className="w-full"
              />
            </div>

            {/* Observation */}
            <div className="space-y-2">
              <Label>Observação</Label>
              <Input
                id="observation"
                type="text"
                className="w-full"
                value={formData.observation}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    observation: e.target.value
                  }))
                }
              />
            </div>

            {/* Custos */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-medium text-foreground">Custos</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="guidesCost" className="text-xs">Custo Guia</Label>
                  <Input
                    id="guidesCost"
                    type="text"
                    placeholder="0"
                    value={formData.guidesCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, guidesCost: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="commissionCost" className="text-xs">Comissão</Label>
                  <Input
                    id="commissionCost"
                    type="text"
                    placeholder="0"
                    value={formData.commissionCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, commissionCost: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ferryCost" className="text-xs">Custo Balsa</Label>
                  <Input
                    id="ferryCost"
                    type="text"
                    placeholder="0"
                    value={formData.ferryCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, ferryCost: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="coolerCost" className="text-xs">Cooler</Label>
                  <Input
                    id="coolerCost"
                    type="text"
                    placeholder="0"
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
                  type="text"
                  placeholder="0"
                  value={formData.fuelCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuelCost: parseFloat(e.target.value) || 0 }))}
                  className="text-sm"
                />
              </div>
            </div>

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
