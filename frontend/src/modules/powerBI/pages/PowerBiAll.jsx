import React, { useState, useEffect } from 'react';
import { usePowerBiStore } from '@/store/usePowerBiStore';
import { useAuthStore } from '@/store/useAuthStore';

import { useNavigate } from 'react-router-dom';
import PbiModal from '../components/PbiModal';
import HomeButton from '../../../components/HomeButton';
import FavoriteHeart from '../../../components/FavoriteHeart';

const PowerBiAll = () => {
    // 🔥 Zustand
    const { 
        powerBis, 
        fetchPowerBis, 
        deletePowerBi,
        isLoading, 
        error 
    } = usePowerBiStore();
    
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPbiData, setCurrentPbiData] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPowerBis();
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate, fetchPowerBis]);

    const handleView = (pbiItem) => {
        navigate('/powerbi-view', { state: { infoPowerBi: pbiItem } });
    };

    const handleEdit = (pbiItem) => {
        setCurrentPbiData(pbiItem);
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleCreate = () => {
        setCurrentPbiData(null);
        setIsEditMode(false);
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la vista "${name}"? Esta acción es irreversible.`)) {
            try {
                await deletePowerBi(id);
            } catch (err) {
                alert("Error al eliminar la vista: " + (err.response?.data?.message || "Error desconocido."));
            }
        }
    };

    if (!isAuthenticated) return <div className="p-6 text-center text-red-500">Acceso denegado. Por favor, inicie sesión.</div>;
    if (isLoading && powerBis.length === 0) return <div className="p-6 text-center">Cargando vistas de Power BI...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Error al cargar las vistas: {error}</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="absolute top-8 right-8 z-10">
                <HomeButton />
            </div>
            <h1 className="text-3xl font-bold mb-10 mt-4 text-gray-800">Mis Vistas de Power BI</h1>

            <button
                onClick={handleCreate}
                className="
                    mb-10
                    px-6 py-2
                    text-sm font-semibold
                    text-green-700
                    border border-green-600
                    rounded-lg
                    hover:bg-green-50
                    hover:text-green-800
                    hover:border-green-700
                    transition-colors
                    "

            >
                + Crear Nueva Vista PBI
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {powerBis.length > 0 ? (
                    powerBis.map((pbi) => (
                        <div key={pbi.id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col">
                            
                            <div className="w-full h-64 bg-gray-100 relative">
                                {pbi.embed_url ? (
                                    <iframe
                                        src={pbi.embed_url}
                                        title={pbi.name}
                                        frameBorder="0"
                                        allowFullScreen={true}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div className="p-4 text-center text-gray-500">URL de embed no disponible.</div>
                                )}
                            </div>

                            <div className="p-4 flex flex-col flex-grow">
                                <h2 className="text-xl font-semibold mb-2 text-gray-900">{pbi.name}</h2>
                                <p className="text-gray-600 text-sm flex-grow mb-4">{pbi.description || "Sin descripción."}</p>

                                {/* Botones de Acción */}
                                <div className="flex justify-end gap-3 mt-auto border-t pt-3">
                                    
                                    {/* ❤️ FAVORITO — justo a la izquierda de Editar */}
                                    <FavoriteHeart type="mypowerbi" objectId={pbi.id} />

                                    <button
                                        onClick={() => handleView(pbi)}
                                        className="px-3 py-1 text-sm font-medium text-green-700 border border-green-700 rounded-md hover:bg-green-50 transition-colors"
                                    >
                                        Ver
                                    </button>


                                    <button
                                        onClick={() => handleEdit(pbi)}
                                        className="px-3 py-1 text-sm font-medium text-blue-700 border border-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => handleDelete(pbi.id, pbi.name)}
                                        className="
                                            px-3 py-1
                                            text-sm font-medium
                                            text-red-600
                                            border border-red-600
                                            rounded-md
                                            hover:bg-red-50
                                            hover:text-red-700
                                            hover:border-red-700
                                            transition-colors
                                            "

                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-3 p-10 text-center text-gray-500 bg-gray-50 rounded-lg">
                        Aún no tienes vistas de Power BI añadidas. ¡Crea una ahora!
                    </div>
                )}
            </div>

            <PbiModal
                showModal={showModal}
                setShowModal={setShowModal}
                initialData={currentPbiData}
                isEditMode={isEditMode}
            />
        </div>
    );
};

export default PowerBiAll;
