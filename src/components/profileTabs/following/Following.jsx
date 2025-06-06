import React from "react";
import NoFollowing from "./NoFollowing";

const Following = ({ data }) => {
  if (!data.length) return <NoFollowing />;

  return (
    <ul className="space-y-2">
      {data.map((f) => (
        <li key={f.id} className="bg-gray-100 p-2 rounded">
          {f.name}
        </li>
      ))}
    </ul>
  );
};

export default Following;
