'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import {
  Home,
  Package,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Factory,
  Wrench,
  UserCheck,
  BarChart,
  Smartphone,
  Palette,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: Array<'worker' | 'manager' | 'admin'>
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Production',
    href: '/production',
    icon: Package,
    roles: ['worker', 'manager', 'admin'],
  },
  {
    title: 'Quality Control',
    href: '/quality',
    icon: ClipboardCheck,
    roles: ['worker', 'manager', 'admin'],
  },
  {
    title: 'Workers',
    href: '/workers',
    icon: Users,
    roles: ['manager', 'admin'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['manager', 'admin'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart,
    roles: ['manager', 'admin'],
  },
]

const adminNavigation: NavItem[] = [
  {
    title: 'Admin',
    href: '/admin',
    icon: Shield,
    roles: ['admin'],
    children: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Worker Approvals',
        href: '/admin/worker-approvals',
        icon: UserCheck,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin'],
  },
]

const workerNavigation: NavItem[] = [
  {
    title: 'Worker Dashboard',
    href: '/worker/dashboard',
    icon: Factory,
    roles: ['worker'],
  },
  {
    title: 'Mobile View',
    href: '/worker/mobile',
    icon: Smartphone,
    roles: ['worker'],
  },
]

const toolsNavigation: NavItem[] = [
  {
    title: 'Product Configurator',
    href: '/product-configurator',
    icon: Palette,
    roles: ['manager', 'admin'],
  },
  {
    title: 'Management',
    href: '/management/workers',
    icon: Wrench,
    roles: ['manager', 'admin'],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { worker, isManager, isAdmin, signOut } = useAuth()

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (!item.roles) return true
      if (isAdmin) return true
      if (isManager && item.roles.includes('manager')) return true
      if (worker && item.roles.includes('worker')) return true
      return false
    })
  }

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true
    return pathname.startsWith(href)
  }

  const userInitials = worker?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??'

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Factory className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ZMF Production</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterNavItems(navigation).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveRoute(item.href)}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterNavItems(adminNavigation).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    {item.children ? (
                      <>
                        <SidebarMenuButton
                          asChild
                          isActive={isActiveRoute(item.href)}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4" />
                          </Link>
                        </SidebarMenuButton>
                        {pathname.startsWith(item.href) && (
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActiveRoute(child.href)}
                                >
                                  <Link href={child.href}>
                                    {child.icon && <child.icon className="h-3 w-3" />}
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActiveRoute(item.href)}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {worker?.role === 'worker' && (
          <SidebarGroup>
            <SidebarGroupLabel>Worker Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterNavItems(workerNavigation).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveRoute(item.href)}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isManager || isAdmin) && (
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterNavItems(toolsNavigation).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveRoute(item.href)}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{worker?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {worker?.role}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs">
                  <span className="font-medium">Email:</span>
                  <span className="ml-2 text-muted-foreground">{worker?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}