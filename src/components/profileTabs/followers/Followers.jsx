import React from "react";
import NoFollowers from "./NoFollowers";

const Followers = ({ data }) => {
  if (!data.length)
    return <NoFollowers/>;

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

export default Followers;
