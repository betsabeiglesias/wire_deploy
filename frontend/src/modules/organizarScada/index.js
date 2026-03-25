import OrganizarScada from "./pages/OrganizarScada";
import ProductionView from "./pages/ProductionView";
import { ScriptEditor } from "./pages/ScriptEditor";
import { Settings } from "lucide-react";

export default {
  id: "organizar_scada",
  label: "Gestión SCADA",
  icon: Settings,
  routes: [
    { path: "/organizar-scada", component: OrganizarScada },
    { path: "/organizar-scada/script", component: ScriptEditor },
    { path: "/scada/production/:id", component: ProductionView }
  ]
};