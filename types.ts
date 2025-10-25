
export type Tab = 'inventory' | 'sales' | 'results' | 'settings';

export interface Settings {
  atelierName: string;
  hourlyRate: number;
  profitMargin: number;
}

export interface Piece {
  id: string;
  name: string;
  category: string;
  photos: string[];
  yarnCost: number;
  accessoriesCost: number;
  otherCosts: number;
  timeHours: number;
  timeMinutes: number;
  salePrice: number;
  stock: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  pieceId: string;
  pieceName: string;
  piecePhoto: string;
  quantity: number;
  salePrice: number;
  baseCost: number;
  profit: number;
  date: string;
}
