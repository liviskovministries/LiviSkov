"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { PanelLeft } from "lucide-react"

// Componentes básicos simplificados
export const SidebarProvider: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  return (
    <div data-sidebar="root" {...props}>
      {children}
    </div>
  )
}

export const Sidebar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn("border-r bg-sidebar", className)} {...props}>
      {children}
    </div>
  )
}

export const SidebarTrigger: React.FC<React.ComponentProps<typeof Button>> = (props) => {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" {...props}>
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          {props.children}
        </SheetContent>
      </Sheet>
    )
  }
  
  return (
    <Button variant="ghost" size="icon" {...props}>
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export const SidebarHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn("flex flex-col gap-2 p-4", className)} {...props} />
  )
}

export const SidebarContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn("flex flex-1 flex-col gap-2 overflow-auto", className)} {...props} />
  )
}

export const SidebarFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn("flex flex-col gap-2 p-4", className)} {...props} />
  )
}

export const SidebarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
  )
}

export const SidebarGroupLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn("text-xs font-medium text-muted-foreground", className)} {...props} />
  )
}

export const SidebarInset: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn("flex-1", className)} {...props} />
  )
}

// Componentes do menu para compatibilidade
export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
  )
)

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  )
)

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="ghost" className={cn("w-full justify-start", className)} {...props} />
  )
)

export const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("ml-4 flex flex-col gap-1", className)} {...props} />
  )
)

export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  )
)

export const SidebarMenuSubButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="ghost" size="sm" className={cn("w-full justify-start", className)} {...props} />
  )
)

SidebarMenu.displayName = "SidebarMenu"
SidebarMenuItem.displayName = "SidebarMenuItem"
SidebarMenuButton.displayName = "SidebarMenuButton"
SidebarMenuSub.displayName = "SidebarMenuSub"
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"