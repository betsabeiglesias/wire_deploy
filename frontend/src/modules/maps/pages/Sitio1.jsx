import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeButton from '../../../components/HomeButton';

const Sitio1 = () => {
    const navigate = useNavigate();
    return (
        <>
        <HomeButton />
        
       
        <div className="flex min-h-screen">
            <main className="flex-1 p-8 ml-[78px] bg-gray-50 text-gray-900">
                <div className="bg-white p-10 rounded-xl shadow-md">
                    <h1 className="text-3xl font-bold mb-6 text-green-700">Página de Detalle - Sitio 1</h1>
                    <p className="text-gray-600 mb-8">Esta es la ruta personalizada: `/sitio-uno`.</p>
                    <button 
                        onClick={() => navigate('/map')} 
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Volver al Mapa
                    </button>
                </div>
            </main>
        </div>
         </>
    );
};

export default Sitio1;