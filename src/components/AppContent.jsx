import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { CSpinner } from "@coreui/react";

// routes config
import routes from "../routes";

const AppContent = () => {
  return (
    <div className="w-full px-4">
      <Suspense fallback={<CSpinner color="primary" />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default React.memo(AppContent);
