import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// --- PÁGINAS PÚBLICAS ---
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// --- PÁGINAS PRINCIPALES ---
import Home from "@/pages/Home";
import HmiPage from "@/modules/hmi/pages/HmiPage";
import OrganizarScada from "@/modules/organizarScada/pages/OrganizarScada";
import ProductionView from "@/modules/organizarScada/pages/ProductionView";
import Map from "@/modules/maps/pages/map";
import Communications from "@/modules/scada/pages/Communications";

// --- CONFIGURACIÓN PLCs ---
import DevicesPage from "@/modules/scada/pages/DevicesPage";
import CreateDevicePage from "@/modules/scada/pages/CreateDevicePage";
import Snap7ConfigPage from "@/modules/scada/pages/Snap7ConfigPage";
import OPCUAConfigPage from "@/modules/scada/pages/OPCUAConfigPage";
import ModbusTCPConfigPage from "@/modules/scada/pages/ModbusTCPConfigPage";
import Isa95SelectorPage from "@/modules/scada/pages/Isa95SelectorPage";
import EditSnap7ConfigPage from "@/modules/scada/pages/EditSnap7ConfigPage";
import EditOPCUAConfigPage from "@/modules/scada/pages/EditOPCUAConfigPage";
import EditModbusTCPConfigPage from "@/modules/scada/pages/EditModbusTCPConfigPage";
import PLCTagsPage from "@/modules/scada/pages/TagsPLCPage";
import CreateTagPage from "@/modules/scada/pages/CreateEditTagPage";

// --- MAPAS ---
import Sitio1 from "@/modules/maps/pages/Sitio1";
import Sitio2 from "@/modules/maps/pages/Sitio2";
import Sitio3 from "@/modules/maps/pages/Sitio3";
import Sitio4 from "@/modules/maps/pages/Sitio4";

// --- USUARIO ---
import UserPage from "@/pages/UserPage";
import SavedPage from "@/pages/SavedPage";
import SettingsPage from "@/pages/SettingsPage";

// --- LAYOUT / POWER BI ---
import Layout from "@/modules/Layout/pages/Layout";
import LayOutDetail from "@/modules/Layout/pages/LayOutDetail";
import PowerBiView from "@/modules/powerBI/pages/PowerBiView";
import PowerBiAll from "@/modules/powerBI/pages/PowerBiAll";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PÚBLICO */}
      <Route path="/login" element={<Login />} />

      {/* PROTEGIDO */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/hmi" element={<ProtectedRoute><HmiPage /></ProtectedRoute>} />
      <Route path="/organizar-scada" element={<ProtectedRoute><OrganizarScada /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />

      {/* SCADA */}
      <Route path="/scada" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
      <Route path="/scada/production/:id" element={<ProtectedRoute><ProductionView /></ProtectedRoute>} />

      {/* DEVICES */}
      <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
      <Route path="/devices/new" element={<ProtectedRoute><CreateDevicePage /></ProtectedRoute>} />
      <Route path="/devices/new/snap7" element={<ProtectedRoute><Snap7ConfigPage /></ProtectedRoute>} />
      <Route path="/devices/new/opcua" element={<ProtectedRoute><OPCUAConfigPage /></ProtectedRoute>} />
      <Route path="/devices/new/modbus" element={<ProtectedRoute><ModbusTCPConfigPage /></ProtectedRoute>} />
      <Route path="/devices/new/isa95" element={<ProtectedRoute><Isa95SelectorPage /></ProtectedRoute>} />
      <Route path="/devices/edit/snap7/:id" element={<ProtectedRoute><EditSnap7ConfigPage /></ProtectedRoute>} />
      <Route path="/devices/edit/opcua/:id" element={<ProtectedRoute><EditOPCUAConfigPage /></ProtectedRoute>} />
      <Route path="/devices/edit/modbus/:id" element={<ProtectedRoute><EditModbusTCPConfigPage /></ProtectedRoute>} />
      <Route path="/devices/:id" element={<ProtectedRoute><PLCTagsPage /></ProtectedRoute>} />
      <Route path="/devices/:id/variables/new" element={<ProtectedRoute><CreateTagPage /></ProtectedRoute>} />
      <Route path="/devices/:id/variables/:tagId/edit" element={<ProtectedRoute><CreateTagPage /></ProtectedRoute>} />

      {/* POWER BI */}
      <Route path="/powerbi-view" element={<ProtectedRoute><PowerBiView /></ProtectedRoute>} />
      <Route path="/powerbi-all" element={<ProtectedRoute><PowerBiAll /></ProtectedRoute>} />

      {/* MAPAS */}
      <Route path="/sitio-uno" element={<ProtectedRoute><Sitio1 /></ProtectedRoute>} />
      <Route path="/sitio-dos" element={<ProtectedRoute><Sitio2 /></ProtectedRoute>} />
      <Route path="/sitio-tres" element={<ProtectedRoute><Sitio3 /></ProtectedRoute>} />
      <Route path="/sitio-cuatro" element={<ProtectedRoute><Sitio4 /></ProtectedRoute>} />

      {/* USUARIO */}
      <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* LAYOUT */}
      <Route path="/layout" element={<ProtectedRoute><Layout /></ProtectedRoute>} />
      <Route path="/layout/:id" element={<ProtectedRoute><LayOutDetail /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
