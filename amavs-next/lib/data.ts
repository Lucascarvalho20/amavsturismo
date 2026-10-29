// Dados de exemplo dos gráficos do dashboard, até haver histórico real no banco.
import type { ChartDataPoint } from './types'

export const demandChartData: ChartDataPoint[] = [
  { name: 'Jan', onibus: 12, micro: 8, van: 15 },
  { name: 'Fev', onibus: 10, micro: 9, van: 12 },
  { name: 'Mar', onibus: 15, micro: 11, van: 18 },
  { name: 'Abr', onibus: 14, micro: 13, van: 16 },
  { name: 'Mai', onibus: 18, micro: 14, van: 20 },
  { name: 'Jun', onibus: 22, micro: 16, van: 24 },
  { name: 'Jul', onibus: 28, micro: 19, van: 30 },
  { name: 'Ago', onibus: 25, micro: 17, van: 28 },
  { name: 'Set', onibus: 20, micro: 15, van: 22 },
  { name: 'Out', onibus: 23, micro: 18, van: 25 },
  { name: 'Nov', onibus: 30, micro: 21, van: 32 },
  { name: 'Dez', onibus: 35, micro: 25, van: 38 },
]

export const revenueChartData: ChartDataPoint[] = [
  { name: 'Jan', previsto: 45000, realizado: 42000 },
  { name: 'Fev', previsto: 42000, realizado: 44500 },
  { name: 'Mar', previsto: 55000, realizado: 58000 },
  { name: 'Abr', previsto: 52000, realizado: 49000 },
  { name: 'Mai', previsto: 60000, realizado: 63500 },
  { name: 'Jun', previsto: 65000, realizado: 68000 },
  { name: 'Jul', previsto: 78000, realizado: 82000 },
  { name: 'Ago', previsto: 72000, realizado: 75000 },
  { name: 'Set', previsto: 58000, realizado: 61000 },
  { name: 'Out', previsto: 63000, realizado: 65000 },
  { name: 'Nov', previsto: 80000, realizado: 85000 },
  { name: 'Dez', previsto: 95000, realizado: 98000 },
]

export const vehicleMixData: ChartDataPoint[] = [
  { name: 'Ônibus', value: 45 },
  { name: 'Micro', value: 30 },
  { name: 'Van', value: 25 },
]
