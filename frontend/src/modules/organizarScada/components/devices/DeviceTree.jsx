const DeviceTree = ({ devices, selected, onSelect }) => {

  return (
    <div className="w-56 border-r bg-slate-50">

      {devices.map(dev => (

        <div
          key={dev}
          onClick={() => onSelect(dev)}
          className={`px-3 py-2 text-sm cursor-pointer
            ${selected === dev
              ? "bg-sky-100 text-sky-700"
              : "hover:bg-slate-100"
            }`}
        >
          {dev}

        </div>

      ))}

    </div>
  );

};

export default DeviceTree;