import { Routes, Route, Navigate } from "react-router-dom";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

import OrganizarScada from "@/modules/organizarScada/pages/OrganizarScada";
import ProductionView from "@/modules/organizarScada/pages/ProductionView";

import Map from "@/modules/maps/pages/map";
import Chatbot from "@/modules/chatbot/pages/Chatbot";
import MlDashboard from "@/modules/ml/pages/MlDashboard";
import ProtectedRoute from "./ProtectedRoute";

import Communications from "@/modules/scada/pages/Communications";

// --- CONFIGURACIÓN PLC'S
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


import Sitio1 from "@/modules/maps/pages/Sitio1";
import Sitio2 from "@/modules/maps/pages/Sitio2";
import Sitio3 from "@/modules/maps/pages/Sitio3";
import Sitio4 from "@/modules/maps/pages/Sitio4";

import UserPage from "@/pages/UserPage";
import SavedPage from "@/pages/SavedPage";
import SettingsPage from "@/pages/SettingsPage";



import TaskExample from "../pages/TaskExample";
import Layout from "../modules/Layout/pages/Layout";
import LayOutDetail from "../modules/Layout/pages/LayOutDetail";
import PowerBiView from "../modules/powerBI/pages/PowerBiView";
import PowerBiAll from "../modules/powerBI/pages/PowerBiAll"
import HmiPage from "../modules/hmi/pages/HmiPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route path="/hmi" element={<HmiPage />} />
      <Route
        path="/organizar-scada"
        element={
          <ProtectedRoute>
            <OrganizarScada />
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/predict"
        element={
          <ProtectedRoute>
            <MlDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/scada" element={<Communications />} />
      <Route path="/devices" element={<DevicesPage />} />
      <Route path="/devices/new" element={<CreateDevicePage/>} />
     
      <Route path="/devices/new/snap7" element={<Snap7ConfigPage/>} />
      <Route path="/devices/new/opcua" element={<OPCUAConfigPage/>} />
      <Route path="/devices/new/modbus" element={<ModbusTCPConfigPage/>} />
      <Route path="/devices/new/isa95" element={<Isa95SelectorPage/>} />

 
      <Route path="/devices/edit/snap7/:id" element={<EditSnap7ConfigPage />} />
      <Route path="/devices/edit/opcua/:id" element={<EditOPCUAConfigPage />} />
      <Route path="/devices/edit/modbus/:id" element={<EditModbusTCPConfigPage />} />
      
      <Route path="/devices/:id" element={<PLCTagsPage/>} />
      <Route path="/devices/:id/variables/new" element={<CreateTagPage />} />
      <Route path="/devices/:id/variables/:tagId/edit" element={<CreateTagPage />} />


      {/* RUTAS AÑADIDAS EN EL CONFLICTO */}
      <Route path="/powerbi-view" element={<ProtectedRoute><PowerBiView /></ProtectedRoute>} />
      <Route path="/powerbi-all" element={<ProtectedRoute><PowerBiAll /></ProtectedRoute>} />

      {/* SITIOS ESTÁTICOS */}
      <Route
        path="/sitio-uno"
        element={
          <ProtectedRoute>
            <Sitio1 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sitio-dos"
        element={
          <ProtectedRoute>
            <Sitio2 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sitio-tres"
        element={
          <ProtectedRoute>
            <Sitio3 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sitio-cuatro"
        element={
          <ProtectedRoute>
            <Sitio4 />
          </ProtectedRoute>
        }
      />

      {/* RUTAS NUEVAS DEL SIDEBAR */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <SavedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/task-project"
        element={
          <ProtectedRoute>
            <TaskExample />
          </ProtectedRoute>
        }
      />

      {/* LAYOUT */}
      <Route
        path="/scada/production/:id"
        element={
          <ProtectedRoute>
            <ProductionView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/layout"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/layout/:id"
        element={
          <ProtectedRoute>
            <LayOutDetail />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}