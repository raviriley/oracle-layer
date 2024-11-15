"use client";

import * as React from "react";
import { BookOpen, Rocket, Search, SendToBack, Sun, Moon } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

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
        title: "Purpose",
        url: "/#conclusion",
      },
      {
        title: "Personal Experience and Feedback",
        url: "/#personal-experience",
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
  const { theme, setTheme } = useTheme();

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
      <SidebarFooter>
        {/* <ThemeSwitch /> */}
        <SidebarMenuButton
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span>Theme</span>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
