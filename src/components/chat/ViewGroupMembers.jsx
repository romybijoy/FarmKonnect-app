const ViewGroupMembers = ({ members, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Group Members</h2>
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="border-b pb-1">
              {member.username || member.name}
            </li>
          ))}
        </ul>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewGroupMembers;
