import React from "react";
import { useNavigate } from 'react-router-dom';
import CreateStoryModal from "./CreateStoryModal";

function AddStoryPage() {
  const navigate = useNavigate();

  return (
    <CreateStoryModal
      isOpen={true}
      onClose={() => navigate(-1)} // go back when modal closes
    />
  );
}

export default AddStoryPage;