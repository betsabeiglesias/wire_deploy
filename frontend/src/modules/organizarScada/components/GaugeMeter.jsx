// src/components/GaugeMeter.jsx

import React, { useState, useEffect } from 'react';

// IMPORTA TUS NUEVAS IMÁGENES AQUÍ
// Asegúrate de que la ruta a tus carpetas 'assets' sea correcta desde aquí
import gaugeBaseNew from '@/assets/images/r1.png'; // <--- TU NUEVA BASE
import gaugeNeedleNew from '@/assets/images/a.png'; // <--- LA AGUJA QUE ME DARÁS

const GaugeMeter = ({ 
    initialValue = 0, 
    minValue = 0, 
    maxValue = 100, 
    label = 'Velocidad', 
    unit = '%', 
    showInput = true, 
    showScroll = true, 
    width = 150, 
    height = 100, 
    isThermometer = false // Ya no es necesario 'isThermometer' directamente aquí si siempre usamos el nuevo estilo
}) => {
    
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(Math.max(minValue, Math.min(maxValue, initialValue)));
    }, [initialValue, minValue, maxValue]);

    // **AJUSTE CLAVE 1: Los ángulos de inicio y fin para TU NUEVA IMAGEN**
    // Observando tu imagen, el 0 está a la izquierda-abajo y el 120 a la derecha-abajo
    // Estos valores son aproximados y puede que necesiten pequeños ajustes
    const startAngle = -120; // Aproximadamente donde empieza el 0 en tu imagen
    const endAngle = 120;   // Aproximadamente donde termina el 120 en tu imagen

    const calculateRotation = (val) => {
        if (maxValue - minValue === 0) return startAngle;
        const normalizedValue = (val - minValue) / (maxValue - minValue);
        const rotation = startAngle + (normalizedValue * (endAngle - startAngle));
        return Math.max(startAngle, Math.min(endAngle, rotation));
    };
    
    const currentAngle = calculateRotation(value);

    const handleInputChange = (e) => {
        let newValue = parseFloat(e.target.value);
        if (isNaN(newValue)) newValue = minValue; 
        newValue = Math.max(minValue, Math.min(maxValue, newValue)); 
        setValue(newValue);
    };

    const renderNewGauge = () => {
        const rotationStyle = {
            transform: `rotate(${currentAngle}deg)`,
            transition: 'transform 0.5s ease-out' 
        };
        
        // Ajusta el tamaño para que el medidor ocupe el espacio
        const size = Math.min(width, height); 

        return (
            // Contenedor del medidor. Aseguramos que la aguja y la base se superpongan correctamente
            <div 
                className="relative flex items-center justify-center max-w-full max-h-full flex-shrink min-h-[50px]" 
                style={{ width: size, height: size }}
            >
                <img 
                    src={gaugeBaseNew} // <--- TU NUEVA BASE
                    alt="Base del medidor" 
                    className="w-full h-full object-contain" 
                />
               <img 
                    src={gaugeNeedleNew} 
                    alt="Aguja del medidor" 
                    // Clase crítica para la rotación desde la base
                    // origin-[50%_95%] dice: 50% horizontal (centro), 95% vertical (casi el borde inferior)
                    className="absolute w-3/5 h-2/8 object-contain origin-bottom orgin-[50%_95%] -top-[-25%] left-[19.7%]  " 
                    style={rotationStyle} 
                />
                
                {/* Visualización del valor */}
                <div className="absolute bottom-1/4 text-[clamp(0.7rem,4vw,1.2rem)] font-bold text-white bg-black/70 px-2 py-[2px] rounded">
                    {value.toFixed(0)}{unit}
                </div>
            </div>
        );
    };

    // --- CONTENEDOR PRINCIPAL ---
    return (
        <div 
            className="flex flex-col items-center justify-between p-[5px] box-border w-full h-full"
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            {renderNewGauge()} {/* Siempre renderiza el nuevo medidor */}

            {showScroll && (
                <input 
                    type="range" 
                    min={minValue} 
                    max={maxValue} 
                    step="1" 
                    value={value} 
                    onChange={handleInputChange} 
                    className="w-4/5 mt-[5px] flex-shrink-0" 
                />
            )}
        </div>
    );
};

export default GaugeMeter;