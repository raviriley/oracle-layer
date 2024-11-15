"use client";

import * as React from "react";
import { BookOpen, Rocket, Search, SendToBack } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const nav = [
  {
    title: "Documentation",
    url: "/",
    icon: BookOpen,
    items: [
      {
        title: "Introduction",
        url: "/#introduction",
      },
      {
        title: "Actively Validated Oracles",
        url: "/#actively-validated-oracles",
      },
      {
        title: "Network Participants",
        url: "/#network-participants",
      },
      {
        title: "Flow Chart",
        url: "/#flow-chart",
      },
      {
        title: "Conclusion",
        url: "/#conclusion",
      },
    ],
  },
  {
    title: "Create",
    url: "/create",
    icon: Rocket,
  },
  {
    title: "Query",
    url: "/query",
    icon: Search,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <SendToBack className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Oracle Generator</span>
            <span className="truncate text-xs">on layer</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={nav} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
