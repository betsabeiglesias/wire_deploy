import HmiPage from "./pages/HmiPage";
import { Monitor } from "lucide-react";

export default {
  id: "hmi_manager",
  label: "HMI",
  icon: Monitor,
  routes: [
    { path: "/hmi", component: HmiPage }
  ]
};