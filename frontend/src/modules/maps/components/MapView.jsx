import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import api from "@/services/api";


// Corrección para el problema de visualización de íconos en Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// Constantes de configuración
const API_URL = '/api/map/locations/';
const DEFAULT_CENTER = [40.4168, -3.7038]; // Madrid
const INITIAL_ZOOM = 6;
const ZOOM_THRESHOLD = 8;
const MAX_ZOOM = 18;
const ZOOM_INCREMENT = 4;

// Límite estricto para que el mapa no se mueva verticalmente al forzar el zoom
const WORLD_BOUNDS = [[-85, -180], [85, 180]];

// ============================================================
//     COMPONENTE INTERNO FLYTOMARKER
// ============================================================
const FlyToMarker = ({ position, name, countryName, direction, postalCode, detailUrl }) => {
    const map = useMap();
    const navigate = useNavigate();
    const markerRef = useRef(null);
    const [currentZoom, setCurrentZoom] = useState(INITIAL_ZOOM);
    const closeTimeoutRef = useRef(null);

    useMapEvents({
        zoomend: () => setCurrentZoom(map.getZoom()),
    });

    const handleZoomClick = () => {
        const newZoom = currentZoom < MAX_ZOOM ? currentZoom + ZOOM_INCREMENT : MAX_ZOOM;
        map.flyTo(position, newZoom, { duration: 1.5 });
        setCurrentZoom(newZoom);
        if (markerRef.current) markerRef.current.openPopup();
    };

    const handleMouseOut = () => {
        if (!markerRef.current) return;

        if (currentZoom >= MAX_ZOOM) {
            // Cerrar tras 5 segundos en zoom cercano
            closeTimeoutRef.current = setTimeout(() => {
                markerRef.current.closePopup();
            }, 5000);
        } else {
            // Cerrar inmediatamente en zoom lejano/intermedio
            markerRef.current.closePopup();
        }
    };

    const handleMouseOver = () => {
        // Cancelar timeout si pasamos el mouse de nuevo
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        if (!markerRef.current) return;

        // Abrir popup en hover si no es zoom máximo
        if (currentZoom < MAX_ZOOM) {
            markerRef.current.openPopup();
        }
    };

    const renderPopupContent = () => {
        if (currentZoom >= MAX_ZOOM) {
            return (
                <div
                    onClick={() => navigate(detailUrl)}
                    className="cursor-pointer text-blue-600 font-semibold underline text-base"
                >
                    Ir al sitio →
                </div>
            );
        }

        if (currentZoom >= ZOOM_THRESHOLD) {
            return (
                <div onClick={handleZoomClick} className="cursor-pointer text-base">
                    <p className="font-bold text-lg mb-1">{name}, {countryName}</p>
                    <p className="text-sm mb-1">
                        Dirección: {direction}
                        {postalCode && <><br />CP: {postalCode}</>}
                    </p>
                    <p className="text-xs text-indigo-500 font-medium">Clic para acercar más</p>
                </div>
            );
        }

        // Zoom lejano → ciudad y país
        return (
            <div className="text-base font-bold">
                {name}, {countryName}
            </div>
        );
    };

    return (
        <Marker
            position={position}
            ref={markerRef}
            eventHandlers={{
                click: handleZoomClick,
                mouseover: handleMouseOver,
                mouseout: handleMouseOut,
            }}
        >
            <Popup autoClose={false} closeOnClick={false}>
                {renderPopupContent()}
            </Popup>
        </Marker>
    );
};

// ============================================================
//                         MAPVIEW PRINCIPAL
// ============================================================
const MapView = () => {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await api.get(API_URL);
                setLocations(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Error al obtener las localizaciones:', err);
                setError('Error al cargar los datos de la API. Backend no accesible.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const SITE_ROUTES = {
        1: "sitio-uno",
        2: "/sitio-dos",
        3: "/sitio-tres",
        4: "/sitio-cuatro",
    };

    if (isLoading) return <div className="text-center p-4">Cargando mapa...</div>;
    if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

    const initialCenter = locations.length > 0
        ? [locations[0].gps_x, locations[0].gps_y]
        : DEFAULT_CENTER;

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden relative z-0">
            <MapContainer
                center={initialCenter}
                zoom={INITIAL_ZOOM}
                minZoom={3} 
                maxBounds={WORLD_BOUNDS}
                maxBoundsViscosity={1.0} // Bloquea el mapa en los bordes sin efecto elástico
                worldCopyJump={true}
                scrollWheelZoom={true}
                bounceAtZoomLimits={false} // <--- EVITA QUE EL MAPA SE MUEVA AL LLEGAR AL LÍMITE DE ZOOM
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {locations.map(loc => {
                    const routeUrlLocalizacion = loc.llevar_a_url || "/map";
                    return (
                        <FlyToMarker
                            key={loc.id}
                            position={[loc.gps_x, loc.gps_y]}
                            name={loc.name}
                            countryName={loc.country_name}
                            direction={loc.direction}
                            postalCode={loc.postal_code}
                            detailUrl={routeUrlLocalizacion}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;

// VERSION 2: MAPA SIN MAX ZOOM OUT:

// import React, { useState, useEffect, useRef } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import { useNavigate } from 'react-router-dom';
// import api from "@/services/api";


// // Corrección para el problema de visualización de íconos en Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
//     iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
//     shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
// });

// // Constantes de configuración
// const API_URL = '/api/map/locations/';
// const DEFAULT_CENTER = [40.4168, -3.7038]; // Madrid
// const INITIAL_ZOOM = 6;
// const ZOOM_THRESHOLD = 8;
// const MAX_ZOOM = 18;
// const ZOOM_INCREMENT = 4;

// // ============================================================
// //    COMPONENTE INTERNO FLYTOMARKER
// // ============================================================
// const FlyToMarker = ({ position, city, countryName, direction, postalCode, detailUrl }) => {
//     const map = useMap();
//     const navigate = useNavigate();
//     const markerRef = useRef(null);
//     const [currentZoom, setCurrentZoom] = useState(INITIAL_ZOOM);
//     const closeTimeoutRef = useRef(null);

//     useMapEvents({
//         zoomend: () => setCurrentZoom(map.getZoom()),
//     });

//     const handleZoomClick = () => {
//         const newZoom = currentZoom < MAX_ZOOM ? currentZoom + ZOOM_INCREMENT : MAX_ZOOM;
//         map.flyTo(position, newZoom, { duration: 1.5 });
//         setCurrentZoom(newZoom);
//         if (markerRef.current) markerRef.current.openPopup();
//     };

//     const handleMouseOut = () => {
//         if (!markerRef.current) return;

//         if (currentZoom >= MAX_ZOOM) {
//             // Cerrar tras 5 segundos en zoom cercano
//             closeTimeoutRef.current = setTimeout(() => {
//                 markerRef.current.closePopup();
//             }, 5000);
//         } else {
//             // Cerrar inmediatamente en zoom lejano/intermedio
//             markerRef.current.closePopup();
//         }
//     };

//     const handleMouseOver = () => {
//         // Cancelar timeout si pasamos el mouse de nuevo
//         if (closeTimeoutRef.current) {
//             clearTimeout(closeTimeoutRef.current);
//             closeTimeoutRef.current = null;
//         }

//         if (!markerRef.current) return;

//         // Abrir popup en hover si no es zoom máximo
//         if (currentZoom < MAX_ZOOM) {
//             markerRef.current.openPopup();
//         }
//     };

//     const renderPopupContent = () => {
//         if (currentZoom >= MAX_ZOOM) {
//             return (
//                 <div
//                     onClick={() => navigate(detailUrl)}
//                     className="cursor-pointer text-blue-600 font-semibold underline text-base"
//                 >
//                     Ir al sitio →
//                 </div>
//             );
//         }

//         if (currentZoom >= ZOOM_THRESHOLD) {
//             return (
//                 <div onClick={handleZoomClick} className="cursor-pointer text-base">
//                     <p className="font-bold text-lg mb-1">{city}, {countryName}</p>
//                     <p className="text-sm mb-1">
//                         Dirección: {direction}
//                         {postalCode && <><br />CP: {postalCode}</>}
//                     </p>
//                     <p className="text-xs text-indigo-500 font-medium">Clic para acercar más</p>
//                 </div>
//             );
//         }

//         // Zoom lejano → ciudad y país
//         return (
//             <div className="text-base font-bold">
//                 {city}, {countryName}
//             </div>
//         );
//     };

//     return (
//         <Marker
//             position={position}
//             ref={markerRef}
//             eventHandlers={{
//                 click: handleZoomClick,
//                 mouseover: handleMouseOver,
//                 mouseout: handleMouseOut,
//             }}
//         >
//             <Popup autoClose={false} closeOnClick={false}>
//                 {renderPopupContent()}
//             </Popup>
//         </Marker>
//     );
// };

// // ============================================================
// //                        MAPVIEW PRINCIPAL
// // ============================================================
// const MapView = () => {
//     const [locations, setLocations] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchLocations = async () => {
//             try {
//                 const res = await api.get(API_URL);
//                 setLocations(Array.isArray(res.data) ? res.data : []);
//             } catch (err) {
//                 console.error('Error al obtener las localizaciones:', err);
//                 setError('Error al cargar los datos de la API. Backend no accesible.');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchLocations();
//     }, []);

//     const SITE_ROUTES = {
//         1: "sitio-uno",
//         2: "/sitio-dos",
//         3: "/sitio-tres",
//         4: "/sitio-cuatro",
//     };

//     if (isLoading) return <div className="text-center p-4">Cargando mapa...</div>;
//     if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

//     const initialCenter = locations.length > 0
//         ? [locations[0].gps_x, locations[0].gps_y]
//         : DEFAULT_CENTER;

//     return (
//         <div className="h-full w-full rounded-2xl overflow-hidden relative z-0">
//             <MapContainer
//                 center={initialCenter}
//                 zoom={INITIAL_ZOOM}
//                 scrollWheelZoom={true}
//                 className="h-full w-full"
//             >
//                 <TileLayer
//                     attribution='&copy; OpenStreetMap'
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />

//                 {locations.map(loc => {
//                     const routeUrlLocalizacion = loc.llevar_a_url || "/map";
//                     return (
//                         <FlyToMarker
//                             key={loc.id}
//                             position={[loc.gps_x, loc.gps_y]}
//                             city={loc.city}
//                             countryName={loc.country_name}
//                             direction={loc.direction}
//                             postalCode={loc.postal_code}
//                             detailUrl={routeUrlLocalizacion}
//                         />
//                     );
//                 })}
//             </MapContainer>
//         </div>
//     );
// };

// export default MapView;
