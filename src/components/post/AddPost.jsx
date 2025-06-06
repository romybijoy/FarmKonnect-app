import React from "react";
import { useNavigate } from 'react-router-dom';
import PostUploadModal from './PostUploadModal';

function AddPostPage() {
  const navigate = useNavigate();

  return (
    <PostUploadModal
      isOpen={true}
      onClose={() => navigate(-1)} // go back when modal closes
    />
  );
}

export default AddPostPage;