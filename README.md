# AutoPOS - Sistema Profesional Automotriz

Sistema POS (Punto de Venta) especializado para talleres y ventas de repuestos, desarrollado con Next.js, Firebase (Firestore & Realtime DB) y Genkit para IA.

## Características Principales

- **Módulo de Contabilidad Profesional**: Libro Diario, Mayor, Balances (P&L, Comprobación) y Conciliación Bancaria bajo normativa NIC 21.
- **Cuentas por Cobrar (CxC)**: Gestión de créditos, cobros multimoneda y detección automática de diferencia de cambio.
- **Cuentas por Pagar (CxP)**: Control de facturas de proveedores y abonos.
- **Inventario Inteligente**: Catálogo de más de 15,000 productos automotrices cargados en RAM para búsquedas instantáneas.
- **Multimoneda**: Soporte nativo para VES, USD y EUR con tasas históricas.

## Guía de Despliegue a GitHub

Si acabas de crear tu repositorio en GitHub, sigue estos pasos en la terminal:

1. **Inicializar Git**:
   ```bash
   git init
   ```

2. **Vincular el Repositorio Remoto**:
   (Reemplaza con tu URL de GitHub)
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   ```

3. **Preparar y Guardar Cambios**:
   ```bash
   git add .
   git commit -m "Initial commit: AutoPOS Full Stack"
   ```

4. **Subir al Repositorio**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Notas Técnicas
- El sistema utiliza **Firestore Transactions** para garantizar la integridad contable en el plan gratuito de Firebase.
- El catálogo de productos se carga en memoria al inicio para optimizar recursos y velocidad.
