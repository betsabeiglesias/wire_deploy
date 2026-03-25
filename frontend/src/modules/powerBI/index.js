import PowerBiAll from "./pages/PowerBiAll";
import PowerBiView from "./pages/PowerBiView";
import { BarChart3 } from "lucide-react";

export default {
  id: "powerbi_manager",
  label: "Power BI",
  icon: BarChart3,
  routes: [
    { path: "/powerbi-all", component: PowerBiAll },
    { path: "/powerbi-view", component: PowerBiView }
  ]
};