'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { menuItems, roleMenuItems } from '@/config/routes';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

// Map role names to Georgian language
const getRoleInGeorgian = (role: string): string => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'ადმინისტრატორი';
    case 'driver':
      return 'მძღოლი';
    case 'salesagent':
      return 'გაყიდვების მენეჯერი';
    case 'customer':
      return 'მომხმარებელი';
    default:
      return 'იტვირთება';
  }
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();

  // Get user role from session
  const userRole = session?.user?.role || '';
  const displayRole = getRoleInGeorgian(userRole);
  
  // Get role-specific menu items or fall back to default
  const navItems = userRole && roleMenuItems[userRole as keyof typeof roleMenuItems] 
    ? roleMenuItems[userRole as keyof typeof roleMenuItems] 
    : menuItems.navMain;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={menuItems.teams} /> */}
        <SidebarMenuButton
          size="lg"
          className="!pb-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font truncate font-semibold">
              {status === 'loading' ? 'ელოდება...' : displayRole}
            </span>
            <span className="truncate text-xs">როლი</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
