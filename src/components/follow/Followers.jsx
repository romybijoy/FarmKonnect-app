const Followers = ({ data }) => {
  if (!data.length)
    return <div className="text-center py-10 text-gray-500">📭 No Followers Found</div>;

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
