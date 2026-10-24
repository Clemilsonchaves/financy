import {
  Baby,
  Banknote,
  Bike,
  Briefcase,
  Bus,
  Car,
  Coffee,
  Dumbbell,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Music,
  PawPrint,
  Pill,
  PiggyBank,
  Plane,
  Receipt,
  Scissors,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Tag,
  Tv,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Palette = { badge: string; tile: string };

const palettes: Palette[] = [
  { badge: "bg-blue-100 text-blue-700", tile: "bg-blue-100 text-blue-600" },
  { badge: "bg-purple-100 text-purple-700", tile: "bg-purple-100 text-purple-600" },
  { badge: "bg-orange-100 text-orange-700", tile: "bg-orange-100 text-orange-600" },
  { badge: "bg-pink-100 text-pink-700", tile: "bg-pink-100 text-pink-600" },
  { badge: "bg-yellow-100 text-yellow-700", tile: "bg-yellow-100 text-yellow-600" },
  { badge: "bg-green-100 text-green-700", tile: "bg-green-100 text-green-600" },
];

const icons: [string[], LucideIcon][] = [
  [["alimenta", "restaurante", "comida", "lanche", "jantar", "almoco", "ifood", "pizza", "delivery"], Utensils],
  [["cafe", "padaria", "bar", "bebida"], Coffee],
  [["mercado", "supermercado", "feira", "acougue", "hortifruti"], ShoppingCart],
  [["compras", "shopping", "loja", "presente"], ShoppingBag],
  [["gasolina", "combustivel", "posto", "etanol"], Fuel],
  [["transporte", "carro", "veiculo", "uber", "estacionamento", "ipva", "oficina"], Car],
  [["onibus", "metro", "trem", "passagem"], Bus],
  [["bicicleta", "bike"], Bike],
  [["viagem", "viagens", "passeio", "ferias", "aviao", "hotel", "turismo"], Plane],
  [["salario", "trabalho", "emprego", "freela", "pro-labore", "renda"], Briefcase],
  [["invest", "poupanca", "reserva", "cofrinho", "acoes", "cdb", "tesouro", "dividendo"], PiggyBank],
  [["banco", "emprestimo", "financiamento", "juros", "tarifa"], Landmark],
  [["dinheiro", "saque", "bonus", "extra", "venda", "cashback"], Banknote],
  [["conta", "boleto", "fatura", "imposto", "taxa", "cartao"], Receipt],
  [["entretenimento", "lazer", "jogo", "game", "diversao", "festa"], Gamepad2],
  [["cinema", "streaming", "netflix", "spotify", "assinatura", "tv"], Tv],
  [["musica", "show", "balada"], Music],
  [["utilidade", "energia", "luz", "agua", "gas", "eletric"], Zap],
  [["internet", "wifi", "telefone", "celular", "plano"], Wifi],
  [["tecnologia", "eletronico", "computador", "software", "app"], Smartphone],
  [["saude", "medic", "hospital", "plano de saude", "consulta", "dentista", "terapia"], HeartPulse],
  [["farmacia", "remedio"], Pill],
  [["academia", "esporte", "fitness", "treino", "musculacao"], Dumbbell],
  [["casa", "moradia", "aluguel", "condominio", "reforma", "iptu"], House],
  [["manutencao", "conserto", "reparo", "ferramenta"], Wrench],
  [["educacao", "curso", "escola", "faculdade", "livro", "estudo", "mensalidade"], GraduationCap],
  [["roupa", "vestuario", "moda", "calcado", "sapato"], Shirt],
  [["beleza", "cabelo", "salao", "barbearia", "estetica"], Scissors],
  [["pet", "cachorro", "gato", "veterinario", "racao"], PawPrint],
  [["filho", "crianca", "bebe", "familia", "creche"], Baby],
  [["doacao", "caridade", "presentes"], Gift],
  [["outros", "diversos", "geral"], Wallet],
];

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function categoryIcon(name?: string | null): LucideIcon {
  if (!name) return Tag;
  const text = normalize(name);
  return icons.find(([words]) => words.some((w) => text.includes(w)))?.[1] ?? Tag;
}

export function categoryStyle(name?: string | null): Palette & { Icon: LucideIcon } {
  if (!name) return { ...palettes[5], Icon: Tag };
  let hash = 0;
  for (const ch of normalize(name)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return { ...palettes[hash % palettes.length], Icon: categoryIcon(name) };
}
