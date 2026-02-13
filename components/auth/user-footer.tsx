"use client";

import { useState } from "react";
import { LogOut, User } from "lucide-react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/store/auth-store";
import { authLogout } from "@/service/auth";
import { AuthDialog } from "./auth-dialog";

export function UserFooter() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isLoggedIn, user, token, clearAuth } = useAuthStore();

  const handleLogout = () => {
    if (token) {
      authLogout(token).catch(() => {});
    }
    clearAuth();
  };

  if (!isLoggedIn) {
    return (
      <>
        <SidebarFooter className="aui-sidebar-footer border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" onClick={() => setDialogOpen(true)}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <User className="size-4" />
                </div>
                <span className="font-semibold">Login</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    );
  }

  const initial = user?.username?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <SidebarFooter className="aui-sidebar-footer border-t">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="group flex w-full items-center gap-2 rounded-md px-2 py-2">
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {initial}
            </div>
            <span className="flex-1 truncate text-sm font-semibold">
              {user?.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100"
              title="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
