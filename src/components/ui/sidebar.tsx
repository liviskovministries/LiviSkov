"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// 1. Definir o tipo do contexto do Sidebar
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  collapsible: "icon" | "full" | false;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

// 2. Hook para usar o contexto do Sidebar
export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// 3. Provedor do Sidebar
interface SidebarProviderProps {
  children: React.ReactNode;
  collapsible?: "icon" | "full" | false;
  defaultOpen?: boolean;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  collapsible = false,
  defaultOpen = true,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const value = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      isCollapsed,
      setIsCollapsed,
      collapsible,
    }),
    [isOpen, setIsOpen, isCollapsed, setIsCollapsed, collapsible]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

// 4. Componente Sidebar
const sidebarVariants = cva(
  "flex flex-col h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out fixed top-0 left-0 z-40", // Adicionado fixed positioning e z-index
  {
    variants: {
      collapsible: {
        icon: "w-16", // Collapsed state for icon
        full: "w-0 md:w-[280px]", // Collapsed state for full (hidden on mobile, full width on desktop)
        false: "w-[280px]", // Always full width
      },
      isOpen: {
        true: "w-[280px]",
        false: "w-16",
      },
    },
    compoundVariants: [
      {
        collapsible: "full",
        isOpen: false,
        className: "w-0 md:w-16", // When collapsible="full" and not open, collapse to icon width on desktop
      },
      {
        collapsible: "icon",
        isOpen: false,
        className: "w-16", // When collapsible="icon" and not open, stay icon width
      },
    ],
    defaultVariants: {
      collapsible: false,
    },
  }
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsible?: "icon" | "full"; // Only allow 'icon' or 'full' for collapsible prop
}

export function Sidebar({
  className,
  collapsible,
  ...props
}: SidebarProps) {
  const { isOpen, isCollapsed, setIsCollapsed, setIsOpen, collapsible: contextCollapsible } = useSidebar();

  const effectiveCollapsible = collapsible || contextCollapsible;

  React.useEffect(() => {
    if (effectiveCollapsible === "icon") {
      setIsCollapsed(!isOpen); // If sidebar is open, it's not collapsed (full width)
    } else if (effectiveCollapsible === "full") {
      setIsCollapsed(!isOpen); // If sidebar is open, it's not collapsed (full width)
    } else {
      setIsCollapsed(false); // Not collapsible, so never collapsed
    }
  }, [isOpen, effectiveCollapsible, setIsCollapsed]);

  return (
    <aside
      className={cn(
        sidebarVariants({
          collapsible: effectiveCollapsible === "icon" ? "icon" : effectiveCollapsible === "full" ? "full" : false,
          isOpen: isOpen,
        }),
        className
      )}
      {...props}
    >
      {props.children}
    </aside>
  );
}

// 5. Componentes de layout do Sidebar
export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-center h-16 border-b border-sidebar-border px-4",
        className
      )}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)} {...props} />
  );
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col p-2 border-t border-sidebar-border",
        className
      )}
      {...props}
    />
  );
}

// 6. Componente Trigger para abrir/fechar o Sidebar
interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarVariants> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { isOpen, setIsOpen, isCollapsed, setIsCollapsed, collapsible } = useSidebar();

  const handleClick = () => {
    if (collapsible === "icon" || collapsible === "full") {
      setIsOpen(!isOpen);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "h-10 w-10", // Default size for icon button
        className
      )}
      {...props}
    />
  );
}