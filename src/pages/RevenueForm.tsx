import { useState, useEffect } from "react";
// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Ícones
import {
  Calendar,
  DollarSign,
  Calculator,
  Plus,
  FileText,
  ArrowLeft,
} from "lucide-react";
// Toast de feedback
import { useToast } from "@/hooks/use-toast";

// ==================== Tipagem ====================
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
  status: string;
  row_number?: number; // ✅ NOVO CAMPO para identificar receitas existentes
}

// ==================== Dados fixos ====================
const sellers = [
  { id: "Rosinha", name: "Rosinha" },
  { id: "Izaias", name: "Izaias" },
];

const status = [
  { id: "ABERTO", name: "ABERTO" },
  { id: "FECHADO", name: "FECHADO" },
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
  { id: "utv4LLestePorSolExt", name: "UTV 4L - Leste C/ Pôr Do Sol Barrinha", defaultValue: 2900 },
];

// ==================== Componente Principal ====================
const RevenueForm = () => {
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState("menu");

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
    observation: "",
    status: "",
    row_number: undefined, // ✅ NOVO CAMPO
  });

  const [freeRevenue, setFreeRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openRevenues, setOpenRevenues] = useState<any[]>([]);

  // ==================== Funções Auxiliares ====================

  // Função que calcula receita livre
  const calculateFreeRevenue = () => {
    const totalCosts =
      formData.guidesCost +
      formData.commissionCost +
      formData.ferryCost +
      formData.coolerCost +
      formData.fuelCost;

    return formData.packageValue - totalCosts;
  };

  // Função para formatar data para input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    
    try {
      // Se a data já está no formato YYYY-MM-DD, retorna como está
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      // Se a data está no formato DD/MM/YYYY, converte
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
      }
      
      // Tenta criar uma data e converter
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return "";
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "";
    }
  };

  // Função para formatar data para exibição (DD/MM/YYYY) - evita problema de fuso horário
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Data não informada";
    
    try {
      // Se a data está no formato YYYY-MM-DD, processa diretamente
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Se a data está no formato DD/MM/YYYY, retorna como está
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      // Para outros formatos, tenta converter evitando problemas de fuso
      const date = new Date(dateString + 'T12:00:00'); // Adiciona horário meio-dia para evitar problemas de fuso
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
      
      return dateString; // Retorna original se não conseguir converter
    } catch (error) {
      console.error("Erro ao formatar data para exibição:", error);
      return dateString;
    }
  };

  // Função para mapear dados da API para o formulário
  const mapeamentoInfos = (rev: any): FormData => {
    return {
      date: formatDateForInput(rev["Data de Entrada"] || ""),
      expedition: expeditions.find(
        exp => exp.name === rev["Passeio"] || exp.id === rev["Passeio"]
      )?.id || "",
      seller: rev["Vendedor Interno"] || "",
      packageValue: parseFloat(rev["Valor do Passeio"] || 0),
      clientName: rev["Nome do Cliente"] || "",
      guidesCost: parseFloat(rev["Custo Guia"] || 0),
      commissionCost: parseFloat(rev["Custo Comissão"] || 0),
      ferryCost: parseFloat(rev["Custo Balsa"] || 0),
      coolerCost: parseFloat(rev["Custo Cooler"] || 0),
      fuelCost: parseFloat(rev["Custo Combustivel"] || 0),
      externalSeller: rev["Vendedor Externo"] || "",
      idVehicle: rev["ID Veiculo"] || "",
      observation: rev["Observação"] || "",
      status: rev["STATUS"] || "ABERTO",
      row_number: rev["row_number"] || rev["Row Number"] || undefined, // ✅ NOVO CAMPO
    };
  };

  // Função para resetar o formulário
  const resetFormData = () => {
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
      observation: "",
      status: "",
      row_number: undefined, // ✅ IMPORTANTE: Limpa o row_number
    });
  };

  // ==================== Effects ====================

  useEffect(() => {
    setFreeRevenue(calculateFreeRevenue());
  }, [formData]);

  // Monitorar mudanças na data para debug
  useEffect(() => {
    console.log("formData.date mudou para:", formData.date);
  }, [formData.date]);

  useEffect(() => {
    if (currentView === "open") {
      const fetchOpenRevenues = async () => {
        setLoading(true);
        try {
          const response = await fetch("https://ron8n.myrvm.com.br/webhook/receitas-aberto");
          
          if (!response.ok) {
            throw new Error(`Erro na rede: ${response.status} - ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log("Dados recebidos da API:", data); // Para debug
          
          if (Array.isArray(data)) {
            setOpenRevenues(data);
          } else if (data && Array.isArray(data.data)) {
            // Caso os dados venham dentro de um objeto com propriedade 'data'
            setOpenRevenues(data.data);
          } else {
            console.error("A resposta recebida não é um array:", data);
            setOpenRevenues([]);
            toast({ 
              title: "Formato de dados inválido", 
              description: "Os dados recebidos não estão no formato esperado.", 
              variant: "destructive" 
            });
          }
        } catch (err) {
          console.error("Erro ao buscar receitas em aberto:", err);
          toast({ 
            title: "Erro ao Carregar", 
            description: "Não foi possível buscar os dados. Verifique sua conexão.", 
            variant: "destructive" 
          });
          setOpenRevenues([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchOpenRevenues();
    }
  }, [currentView, toast]);

  // ==================== Handlers ====================

  // Alterações de Selects
  const handleSellerChange = (sellerId: string) => {
    setFormData((prev) => ({ ...prev, seller: sellerId }));
  };

  const handleStatusChange = (statusId: string) => {
    setFormData((prev) => ({ ...prev, status: statusId }));
  };

  const handleExpeditionChange = (expeditionId: string) => {
    const expedition = expeditions.find((exp) => exp.id === expeditionId);
    if (expedition) {
      setFormData((prev) => ({
        ...prev,
        expedition: expeditionId,
        packageValue: expedition.defaultValue,
      }));
    }
  };

  // Envia dados para o webhook (N8N) - CREATE ou UPDATE
  const handleSubmit = async () => {
    if (!formData.date || !formData.expedition || !formData.status) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...formData,
      receitaLivre: freeRevenue,
      operation: formData.row_number ? "update" : "create", // ✅ NOVO CAMPO
    };

    try {
      const response = await fetch(
        "https://ron8n.myrvm.com.br/webhook/entrada-receita",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Erro ao enviar para o N8N");

      const isUpdate = formData.row_number !== undefined;
      
      toast({
        title: isUpdate ? "Receita Atualizada!" : "Receita Registrada!",
        description: `Receita livre: R$ ${freeRevenue.toFixed(2)}`,
      });

      // Limpa formulário
      resetFormData();
      setCurrentView("menu");
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast({
        title: "Erro ao enviar",
        description: "Verifique sua conexão ou o endpoint do N8N.",
        variant: "destructive",
      });
    }
  };

  // ==================== TELAS ====================

  // MENU PRINCIPAL
  if (currentView === "menu") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <DollarSign className="w-6 h-6 text-primary" />
                Rumo dos Ventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => {
                  resetFormData(); // ✅ Garante que é uma nova receita
                  setCurrentView("register");
                }}
                variant="hero"
                size="lg"
                className="w-full h-16 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar Receita
              </Button>

              <Button
                onClick={() => setCurrentView("open")}
                variant="outline"
                size="lg"
                className="w-full h-16 text-lg"
              >
                <FileText className="w-5 h-5 mr-2" />
                Receitas em Aberto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // RECEITAS EM ABERTO
  if (currentView === "open") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView("menu")}
                    className="p-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Receitas em Aberto
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Força uma nova busca
                    setCurrentView("menu");
                    setTimeout(() => setCurrentView("open"), 100);
                  }}
                  disabled={loading}
                >
                  🔄 Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Carregando receitas em aberto...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {!Array.isArray(openRevenues) || openRevenues.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma receita em aberto
                    </p>
                  ) : (
                    openRevenues.map((rev, i) => (
                      <Card
                        key={i}
                        className="p-3 cursor-pointer hover:bg-gray-100 border-l-4 border-l-blue-500"
                        onClick={() => {
                          const mappedRevenue = mapeamentoInfos(rev);
                          setFormData(mappedRevenue);
                          setCurrentView("register");
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {rev["Passeio"] || "Expedição não informada"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {rev["Nome do Cliente"] || "Cliente não informado"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDateForDisplay(rev["Data de Entrada"])}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              R$ {rev["Valor do Passeio"] || 0}
                            </p>
                            <p className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {rev["STATUS"] || "ABERTO"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // FORMULÁRIO DE REGISTRO/EDIÇÃO
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView("menu")}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Plus className="w-5 h-5 text-green-600" />
                {formData.row_number ? "Editar Receita" : "Nova Receita"}
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Data */}
            <div className="space-y-2">
              <label htmlFor="date" className="flex items-center gap-2 font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                Data *
              </label>
              <input
                id="date"
                type="date"
                value={formData.date || ""} // ✅ Adiciona || "" para evitar undefined
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Expedição */}
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Expedição *</label>
              <select
                value={formData.expedition}
                onChange={(e) => handleExpeditionChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione a expedição</option>
                {expeditions.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendedor */}
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Vendedor</label>
              <select
                value={formData.seller}
                onChange={(e) => handleSellerChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o vendedor</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor do Pacote */}
            <div className="space-y-2">
              <label htmlFor="packageValue" className="flex items-center gap-2 font-medium text-gray-700">
                <DollarSign className="w-4 h-4" />
                Valor do Pacote (R$)
              </label>
              <input
                id="packageValue"
                type="number"
                value={formData.packageValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    packageValue: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0.00"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Nome do Cliente */}
            <div className="space-y-2">
              <label htmlFor="clientName" className="font-medium text-gray-700">Nome do Cliente</label>
              <input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clientName: e.target.value }))
                }
                placeholder="Nome do cliente"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* ID Veículo */}
            <div className="space-y-2">
              <label htmlFor="idVehicle" className="font-medium text-gray-700">ID do Veículo</label>
              <input
                id="idVehicle"
                value={formData.idVehicle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, idVehicle: e.target.value }))
                }
                placeholder="ID do veículo"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Custos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="guidesCost" className="font-medium text-gray-700">Custo Guias (R$)</label>
                <input
                  id="guidesCost"
                  type="number"
                  value={formData.guidesCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guidesCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="commissionCost" className="font-medium text-gray-700">Comissão (R$)</label>
                <input
                  id="commissionCost"
                  type="number"
                  value={formData.commissionCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commissionCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ferryCost" className="font-medium text-gray-700">Custo Balsa (R$)</label>
                <input
                  id="ferryCost"
                  type="number"
                  value={formData.ferryCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ferryCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="coolerCost" className="font-medium text-gray-700">Custo Cooler (R$)</label>
                <input
                  id="coolerCost"
                  type="number"
                  value={formData.coolerCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coolerCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label htmlFor="fuelCost" className="font-medium text-gray-700">Custo Combustível (R$)</label>
                <input
                  id="fuelCost"
                  type="number"
                  value={formData.fuelCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fuelCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vendedor Externo */}
            <div className="space-y-2">
              <label htmlFor="externalSeller" className="font-medium text-gray-700">Vendedor Externo</label>
              <input
                id="externalSeller"
                value={formData.externalSeller}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, externalSeller: e.target.value }))
                }
                placeholder="Nome do vendedor externo"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o status</option>
                {status.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <label htmlFor="observation" className="font-medium text-gray-700">Observação</label>
              <input
                id="observation"
                value={formData.observation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, observation: e.target.value }))
                }
                placeholder="Observações sobre a receita"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Receita Livre */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Receita Livre:</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    R$ {freeRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setCurrentView("menu")}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
              >
                {formData.row_number ? "Atualizar Receita" : "Salvar Receita"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueForm;

