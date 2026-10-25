import {
  Baby,
  Banknote,
  Bike,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  Coffee,
  Dumbbell,
  FileText,
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
  Ticket,
  Tv,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Palette = { badge: string; tile: string };

export const COLOR_OPTIONS = {
  green: { badge: "bg-green-100 text-green-700", tile: "bg-green-100 text-green-600", swatch: "bg-green-600" },
  blue: { badge: "bg-blue-100 text-blue-700", tile: "bg-blue-100 text-blue-600", swatch: "bg-blue-600" },
  purple: { badge: "bg-purple-100 text-purple-700", tile: "bg-purple-100 text-purple-600", swatch: "bg-purple-600" },
  pink: { badge: "bg-pink-100 text-pink-700", tile: "bg-pink-100 text-pink-600", swatch: "bg-pink-600" },
  red: { badge: "bg-red-100 text-red-700", tile: "bg-red-100 text-red-600", swatch: "bg-red-600" },
  orange: { badge: "bg-orange-100 text-orange-700", tile: "bg-orange-100 text-orange-600", swatch: "bg-orange-600" },
  yellow: { badge: "bg-yellow-100 text-yellow-700", tile: "bg-yellow-100 text-yellow-600", swatch: "bg-yellow-600" },
} satisfies Record<string, Palette & { swatch: string }>;

export type CategoryColor = keyof typeof COLOR_OPTIONS;
const colorKeys = Object.keys(COLOR_OPTIONS) as CategoryColor[];

export const ICON_OPTIONS = {
  briefcase: Briefcase,
  car: Car,
  "heart-pulse": HeartPulse,
  "piggy-bank": PiggyBank,
  "shopping-cart": ShoppingCart,
  ticket: Ticket,
  gift: Gift,
  utensils: Utensils,
  "paw-print": PawPrint,
  house: House,
  plane: Plane,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  "shopping-bag": ShoppingBag,
  wallet: Wallet,
  "file-text": FileText,
} satisfies Record<string, LucideIcon>;

export type CategoryIconKey = keyof typeof ICON_OPTIONS;

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

type StyleSource = { name?: string | null; icon?: string | null; color?: string | null };

// Ícone/cor escolhidos têm prioridade; sem escolha, derivam do nome.
export function categoryStyle(category?: StyleSource | null): Palette & { Icon: LucideIcon } {
  const name = category?.name;
  const chosenIcon = category?.icon ? (ICON_OPTIONS as Record<string, LucideIcon>)[category.icon] : undefined;
  const chosenColor = category?.color ? (COLOR_OPTIONS as Record<string, Palette>)[category.color] : undefined;

  let hash = 0;
  for (const ch of normalize(name ?? "")) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const palette = chosenColor ?? COLOR_OPTIONS[name ? colorKeys[hash % colorKeys.length] : "green"];

  return { badge: palette.badge, tile: palette.tile, Icon: chosenIcon ?? categoryIcon(name) };
}
