import Map from "./pages/map";
import Sitio1 from "./pages/Sitio1";
import Sitio2 from "./pages/Sitio2";
import Sitio3 from "./pages/Sitio3";
import Sitio4 from "./pages/Sitio4";
import { Map as MapIcon } from "lucide-react";

export default {
  id: "map_manager",
  label: "Mapas",
  icon: MapIcon,
  routes: [
    { path: "/map", component: Map },
    { path: "/sitio-uno", component: Sitio1 },
    { path: "/sitio-dos", component: Sitio2 },
    { path: "/sitio-tres", component: Sitio3 },
    { path: "/sitio-cuatro", component: Sitio4 }
  ]
};