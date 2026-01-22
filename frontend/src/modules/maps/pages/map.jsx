import MapView from '../components/MapView';


function Map() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mapa Interactivo</h1>
      <MapView />
    </div>
  );
}

export default Map;


// import MapView from '@/components/MapView';
// import { useState } from 'react';


// export default function Map() {

//   const [locations, setLocations] = useState("")

//   const [contador, setContador] = useState(0)

//   const otra = "filo"

//   return (
//     <div>
//       <h1 className="text-4xl font-extrabold text-center text-blue-600 mt-8 mb-6">
//         Esta es la página de Map
//       </h1>


//       <input className="bg-blue-200" type="text" onChange={ (e) => {
//         setLocations(e.target.value)
//       }} />


//       <span>la variable es {locations}</span>
//       <br />
//       <span>{otra}</span>
//       <br />
//       <button className='bg-green-200 p-3' onClick={()=>{
//         setContador(contador +1)
//       }}>
//         sumar
//       </button>

//       <div className='bg-red-500'>
//         <span>{contador}</span>
//       </div>

//     </div>
//   );
// }

