"use client"

import * as React from "react"
import {
  Home,
  BookOpen,
  CloudSun,
  Sprout,
  Trophy,
  Users,
  BarChart3,
  Compass,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "AI Lesson", url: "/lessons", icon: BookOpen },
  { title: "Forecast", url: "/forecast", icon: CloudSun },
  { title: "Plant Detection", url: "/plant", icon: Sprout },
  { title: "Eco Challenges", url: "/challenges", icon: Trophy },
  { title: "Compare Cities", url: "/compare", icon: Compass },
  { title: "Teacher Hub", url: "/teacher", icon: Users },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="bg-sidebar border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">EcoLearn AI</span>
            <span className="text-xs text-secondary">Student Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className="hover:bg-sidebar-accent transition-colors py-6"
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="size-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border" suppressHydrationWarning>
        <div className="flex items-center gap-2 px-2" suppressHydrationWarning>
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-primary font-bold" suppressHydrationWarning>JD</div>
          <div className="flex flex-col" suppressHydrationWarning>
            <span className="text-sm font-medium text-white">John Doe</span>
            <span className="text-xs text-muted-foreground">Level 12 • 450 pts</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}