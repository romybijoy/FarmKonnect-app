import React from "react";
import NoGroups from "./NoGroups";
const Groups = ({ data }) => {
  if (!data.length) return <NoGroups />;

  return (
    <ul className="space-y-2">
      {data.map((g) => (
        <li key={g.id} className="bg-gray-100 p-2 rounded">
          {g.group}
        </li>
      ))}
    </ul>
  );
};

export default Groups;
