const DeviceTable = ({ tags, onUpdateTag, onAddTag }) => {

  return (

    <div className="flex-1 overflow-auto">

      <table className="w-full text-xs">

        <thead>
          <tr className="bg-slate-100">
            <th>Tag</th>
            <th>Variable</th>
            <th>Datatype</th>
            <th>Device</th>
            <th>Equipment</th>
            <th>Address</th>
          </tr>
        </thead>

        <tbody>

          {tags.map(tag => (

            <tr key={tag.tag}>

              <td>{tag.tag}</td>

              <td>
                <input
                  value={tag.variable}
                  onChange={(e)=>onUpdateTag(tag,"variable",e.target.value)}
                />
              </td>

              <td>{tag.datatype}</td>

              <td>{tag.device}</td>

              <td>{tag.equipment}</td>

              <td>{tag.address}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

};

export default DeviceTable;