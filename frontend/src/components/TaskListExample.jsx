// import { useEffect, useState } from "react";

// export default function TaskListExample() {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Definimos la URL base usando la variable de entorno.
//   // Ya no usamos 'http://localhost:8000' a pelo.
//   const API_URL = import.meta.env.VITE_API_URL;

//   useEffect(() => {
//     // Ahora usamos aqui la variable API_URL en vez de meter el puerto a pelo
//     fetch(`${API_URL}/api/management/tasks/`)

//       .then((res) => res.json())
//       .then((data) => {
//         setTasks(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching tasks:", err);
//         setLoading(false);
//       });
//   }, [API_URL]);  // Añadimos API_URL como dependencia por buena práctica

//   if (loading) return <p className="text-center mt-10">Cargando...</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Listado de Tasks</h1>

//       <table className="min-w-full bg-white border border-gray-200 shadow">
//         <thead>
//           <tr className="bg-gray-100 text-left">
//             <th className="p-3 border">ID</th>
//             <th className="p-3 border">Name</th>
//             <th className="p-3 border">Employees</th>
//             <th className="p-3 border">Project</th>
//             <th className="p-3 border">Status</th>
//             <th className="p-3 border">Priority</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tasks.map((task) => (
//             <tr key={task.id} className="hover:bg-gray-50">
//               <td className="p-3 border">{task.id}</td>
//               <td className="p-3 border">{task.name}</td>
//               <td className="p-3 border">{task.employees?.join(", ") || "N/A"}</td>
//               <td className="p-3 border">{task.fk_project}</td>
//               <td className="p-3 border">{task.status}</td>
//               <td className="p-3 border">{task.priority}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
