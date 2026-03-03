import React, { useState, useEffect, useMemo } from 'react';
import { usePowerBiStore } from '@/store/usePowerBiStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import PbiModal from '../components/PbiModal';
import HomeButton from '../../../components/HomeButton';
import FavoriteHeart from '../../../components/FavoriteHeart';

// DND Kit
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PowerBiAll = () => {
    const { powerBis: storePowerBis, fetchPowerBis, deletePowerBi, updatePowerBiOrder, isLoading, error } = usePowerBiStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const [powerBis, setPowerBis] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPbiData, setCurrentPbiData] = useState(null);

    useEffect(() => {
        if (isAuthenticated) fetchPowerBis();
        else navigate('/login');
    }, [isAuthenticated]);

    useEffect(() => {
        setPowerBis(storePowerBis);
    }, [storePowerBis]);

    // Lógica de filtrado por nombre
    const filteredPowerBis = useMemo(() => {
        return powerBis.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [powerBis, searchTerm]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = powerBis.findIndex((p) => p.id === active.id);
        const newIndex = powerBis.findIndex((p) => p.id === over.id);
        const newArray = arrayMove(powerBis, oldIndex, newIndex);

        setPowerBis(newArray);
        try {
            await updatePowerBiOrder(newArray);
        } catch (err) {
            setPowerBis(storePowerBis);
            alert("Error al guardar el orden");
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Eliminar "${name}"?`)) {
            try { await deletePowerBi(id); } catch (err) { alert("Error al eliminar"); }
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="absolute top-8 right-8 z-10"><HomeButton /></div>
            <h1 className="text-3xl font-bold mb-10 mt-4 text-gray-800">Mis Vistas de Power BI</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
            
                <input
                    type="text"
                    placeholder="Buscar Power BI por nombre..."
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button
                    onClick={() => { setCurrentPbiData(null); setIsEditMode(false); setShowModal(true); }}
                    className="px-6 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded-lg hover:bg-green-50 transition-all w-full md:w-auto"
                >
                    + Crear Nueva Vista PBI
                </button>
                
            </div>

            {isLoading && <p className="text-gray-500">Cargando vistas...</p>}

            {!isLoading && filteredPowerBis.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredPowerBis.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPowerBis.map((pbi) => (
                                <SortablePbiCard 
                                    key={pbi.id} 
                                    pbi={pbi} 
                                    onDelete={handleDelete} 
                                    onEdit={(p) => { setCurrentPbiData(p); setIsEditMode(true); setShowModal(true); }}
                                    onView={(p) => navigate('/powerbi-view', { state: { infoPowerBi: p } })}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {!isLoading && powerBis.length > 0 && filteredPowerBis.length === 0 && (
                <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-lg">
                    No se encontraron vistas con el nombre "{searchTerm}".
                </div>
            )}

            {powerBis.length === 0 && !isLoading && (
                <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-lg">Aún no tienes vistas.</div>
            )}

            <PbiModal showModal={showModal} setShowModal={setShowModal} initialData={currentPbiData} isEditMode={isEditMode} />
        </div>
    );
};

function SortablePbiCard({ pbi, onDelete, onEdit, onView }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pbi.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        zIndex: isDragging ? 50 : 0,
        position: "relative"
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border rounded-xl shadow-lg overflow-hidden flex flex-col transition-all ${
                isDragging ? "shadow-2xl scale-105 opacity-90 ring-2 ring-blue-500/20" : "border-gray-200"
            }`}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <div className="w-full h-64 bg-gray-100 relative pointer-events-none">
                    {pbi.embed_url ? (
                        <iframe src={pbi.embed_url} title={pbi.name} frameBorder="0" className="w-full h-full" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Sin vista previa</div>
                    )}
                    <div className="absolute inset-0 bg-transparent" />
                </div>
                <div className="p-4 flex-grow bg-white border-t">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">{pbi.name}</h2>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{pbi.description || "Sin descripción."}</p>
                </div>
            </div>

            <div className="p-4 flex justify-end gap-3 mt-auto border-t bg-gray-50">
                <FavoriteHeart type="mypowerbi" objectId={pbi.id} />
                <button onClick={() => onView(pbi)} className="px-3 py-1 text-sm font-medium text-green-700 border border-green-700 rounded-md hover:bg-green-100 transition-all active:scale-95">Ver</button>
                <button onClick={() => onEdit(pbi)} className="px-3 py-1 text-sm font-medium text-blue-700 border border-blue-700 rounded-md hover:bg-blue-100 transition-all active:scale-95">Editar</button>
                <button onClick={() => onDelete(pbi.id, pbi.name)} className="px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-all active:scale-95">Eliminar</button>
            </div>
        </div>
    );
}

export default PowerBiAll;