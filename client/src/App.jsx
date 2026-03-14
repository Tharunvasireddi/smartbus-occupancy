import { Outlet } from "@tanstack/react-router";

export const rooteLayout = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Outlet />
    </div>
  );
};
