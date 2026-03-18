const TagRow = ({ tag }) => {

  return (

    <tr className="border-b">

      <td className="p-2">
        {tag.tag}
      </td>

      <td className="p-2">

        <input
          defaultValue={tag.variable}
          className="border rounded px-2 py-1 text-xs w-full"
        />

      </td>

      <td className="p-2">
        {tag.datatype}
      </td>

      <td className="p-2">
        {tag.equipment}
      </td>

      <td className="p-2">
        {tag.address || "-"}
      </td>

    </tr>

  );

};

export default TagRow;