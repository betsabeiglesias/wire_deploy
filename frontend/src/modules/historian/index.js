import HistorianPage from "./pages/HistorianPage";
import HistorianDashboardList from "./pages/HistorianDashboardList";
import HistorianDashboard from "./pages/HistorianDashboard";
import { BarChart2 } from "lucide-react";

export default {
  id: "historian",
  label: "Historian",
  icon: BarChart2,
  routes: [
    { path: "/historian",                  component: HistorianPage           },
    { path: "/historian/dashboards",       component: HistorianDashboardList  },
    { path: "/historian/dashboards/:id",   component: HistorianDashboard      },
  ],
};
