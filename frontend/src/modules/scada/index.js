import Communications from "./pages/Communications";
import DevicesPage from "./pages/DevicesPage";
import CreateDevicePage from "./pages/CreateDevicePage";
import Snap7ConfigPage from "./pages/Snap7ConfigPage";
import OPCUAConfigPage from "./pages/OPCUAConfigPage";
import ModbusTCPConfigPage from "./pages/ModbusTCPConfigPage";
import Isa95SelectorPage from "./pages/Isa95SelectorPage";
import EditSnap7ConfigPage from "./pages/EditSnap7ConfigPage";
import EditOPCUAConfigPage from "./pages/EditOPCUAConfigPage";
import EditModbusTCPConfigPage from "./pages/EditModbusTCPConfigPage";
import PLCTagsPage from "./pages/TagsPLCPage";
import CreateTagPage from "./pages/CreateEditTagPage";
import { Cpu } from "lucide-react";

export default {
  id: "scada_manager",
  label: "SCADA",
  icon: Cpu,
  routes: [
    { path: "/scada", component: Communications },
    { path: "/devices", component: DevicesPage },
    { path: "/devices/new", component: CreateDevicePage },
    { path: "/devices/new/snap7", component: Snap7ConfigPage },
    { path: "/devices/new/opcua", component: OPCUAConfigPage },
    { path: "/devices/new/modbus", component: ModbusTCPConfigPage },
    { path: "/devices/new/isa95", component: Isa95SelectorPage },
    { path: "/devices/edit/snap7/:id", component: EditSnap7ConfigPage },
    { path: "/devices/edit/opcua/:id", component: EditOPCUAConfigPage },
    { path: "/devices/edit/modbus/:id", component: EditModbusTCPConfigPage },
    { path: "/devices/:id", component: PLCTagsPage },
    { path: "/devices/:id/variables/new", component: CreateTagPage },
    { path: "/devices/:id/variables/:tagId/edit", component: CreateTagPage }
  ]
};