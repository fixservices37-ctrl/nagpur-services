import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AdminAuthProvider } from "@/components/admin/auth";

/**
 * Layout for every /admin page. It only provides the auth context — the guard
 * and chrome live in <AdminShell> so the login page can opt out of both.
 */
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}
