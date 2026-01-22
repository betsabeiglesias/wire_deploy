// src/services/router.js

import { createRef } from 'react';

// Referencia mutable a la función de navegación (useNavigate)
export const navigateRef = createRef(); 

// Función de ayuda para la navegación externa
export const navigateTo = (path, options = {}) => {
    if (navigateRef.current) {
        // Llama a la función navigate de react-router-dom
        navigateRef.current(path, options);
    }
};