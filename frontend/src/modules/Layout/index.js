import Layout from "./pages/Layout";
import LayOutDetail from "./pages/LayOutDetail";
import { LayoutGrid } from "lucide-react";

export default {
  id: "layout_manager",
  label: "Layouts",
  icon: LayoutGrid,
  routes: [
    { path: "/layout", component: Layout },
    { path: "/layout/:id", component: LayOutDetail }
  ]
};