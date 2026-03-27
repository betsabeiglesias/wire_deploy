// frontend/src/modules/organizarScada/components/widgets/iconMap.js

import {
  Gauge,
  BarChart3,
  LineChart,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Table,
  Box,
  Layers,
} from "lucide-react";

import {
  IconTemperature,
  IconPressure,
  IconTank,
  IconValve,
  IconFlow,
} from "./icons_ui";

export const ICON_MAP = {
  // ───── PROCESO / MEDIDAS ─────
  gauge: Gauge,                    // gauges circulares
  temperature: IconTemperature,    // temperatura — termómetro industrial
  flow: IconFlow,                 // caudal — tubería con flechas
  pressure: IconPressure,           // presión — manómetro analógico
  tank: IconTank,                // tanque / depósito cilíndrico
  valve: IconValve,              // válvula — símbolo P&ID

  // ───── VISUALIZACIÓN ─────
  chart: LineChart,
  chartBar: BarChart3,
  realtime: Activity,

  // ───── ESTRUCTURA ─────
  container: Box,
  layer: Layers,

  // ───── DATOS ─────
  table: Table,

  // ───── UI / DASHBOARD ─────
  card: LayoutDashboard,

  // ───── ESTADOS ─────
  status_ok: CheckCircle2,
  status_warning: AlertTriangle,
  status_error: XCircle,
};