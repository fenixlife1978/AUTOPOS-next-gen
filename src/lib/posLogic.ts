
export function fmt(n: number): string {
  return '$' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function fechaStr(d: Date = new Date()): string {
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function horaStr(d: Date = new Date()): string {
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function fechaISO(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

export function calcularPrecio(costo: number, ganancia: number, iva: number = 16): number {
  return (costo + (costo * (ganancia / 100))) * (1 + (iva / 100));
}
