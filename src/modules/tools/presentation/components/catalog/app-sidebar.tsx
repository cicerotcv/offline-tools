import { Link, useLocation } from '@tanstack/react-router';
import { LayoutGrid } from 'lucide-react';

import { toolCategories } from '@/shared/presentation/tools/tool-registry';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '$/components/ui/sidebar';

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-12 justify-center border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/tools'}
              tooltip="All tools"
            >
              <Link to="/tools">
                <LayoutGrid />
                <span>All tools</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {toolCategories.map((category) => (
          <SidebarGroup key={category.id}>
            <SidebarGroupLabel>{category.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.tools.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(tool.path)}
                      tooltip={tool.title}
                    >
                      <Link to={tool.path}>
                        <tool.icon />
                        <span>{tool.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
