
export function fmt(n: number, symbol: string = '$'): string {
  const s = symbol === 'VES' ? 'Bs. ' : symbol === 'USD' ? '$ ' : symbol + ' ';
  return s + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function fechaStr(d: Date = new Date()): string {
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function horaStr(d: Date = new Date()): string {
  return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
}

export function fechaISO(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

export function calcularPrecio(costo: number, ganancia: number, iva: number = 16): number {
  return (costo + (costo * (ganancia / 100))) * (1 + (iva / 100));
}

export function getAgingCategory(vencimiento: string): string {
  const hoy = new Date();
  const venc = new Date(vencimiento);
  const diffTime = hoy.getTime() - venc.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'Vigente';
  if (diffDays <= 30) return '0-30 días';
  if (diffDays <= 60) return '31-60 días';
  if (diffDays <= 90) return '61-90 días';
  return '+90 días';
}
