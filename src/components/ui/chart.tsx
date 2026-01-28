"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = `chart-${id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={uniqueId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:stroke-border [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      let actualLabel = label
      if (labelKey && payload[0]?.payload?.[labelKey] !== undefined) {
        actualLabel = payload[0].payload[labelKey]
      }

      if (labelFormatter) {
        actualLabel = labelFormatter(actualLabel, payload)
      }

      return (
        <div className={cn("font-medium", labelClassName)}>{actualLabel}</div>
      )
    }, [hideLabel, label, labelFormatter, payload, labelKey, labelClassName])

    if (!active || !payload?.length) {
      return null
    }

    const items = payload.map((item) => {
      const itemConfig = item.dataKey ? config[item.dataKey as string] : undefined
      if (!itemConfig) {
        return null
      }

      const actualColor =
        itemConfig.color ??
        itemConfig.theme?.[
          document.documentElement.classList.contains("dark")
            ? "dark"
            : "light"
        ]

      // SIMPLIFICADO: não usar formatter para evitar problemas de tipo
      const formattedValue = item.value !== undefined ? String(item.value) : ''

      return {
        ...item,
        ...itemConfig,
        color: actualColor,
        value: formattedValue,
      }
    }).filter(Boolean)

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {tooltipLabel}
        <div className="grid gap-1.5">
          {items.map((item) => {
            if (!item) return null

            const Icon = item.icon

            return (
              <div
                key={String(item.dataKey)}
                className="flex w-full items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:shrink-0"
              >
                {!hideIndicator && (
                  <div
                    className="shrink-0 rounded-[2px] border-[--color] bg-[--color]"
                    style={
                      {
                        "--color": item.color,
                      } as React.CSSProperties
                    }
                  />
                )}
                <span className="flex-1 truncate">{item.label}</span>
                <span className="font-medium tabular-nums">
                  {String(item.value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    const items = payload.map((item) => {
      const key = nameKey ? (item.payload as any)?.[nameKey] : String(item.dataKey)

      const itemConfig = key ? config[key] : null
      if (!itemConfig) {
        return null
      }

      const actualColor =
        itemConfig.color ??
        itemConfig.theme?.[
          document.documentElement.classList.contains("dark")
            ? "dark"
            : "light"
        ]

      return {
        ...item,
        ...itemConfig,
        color: actualColor,
      }
    }).filter(Boolean)

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" && "order-1",
          verticalAlign === "bottom" && "order-3",
          className
        )}
      >
        {items.map((item) => {
          if (!item) return null

          const Icon = item.icon

          return (
            <div
              key={String(item.dataKey)}
              className="flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:shrink-0"
            >
              {!hideIcon && (
                <div
                  className="size-2 shrink-0 rounded-[2px]"
                  style={
                    {
                      backgroundColor: item.color,
                    } as React.CSSProperties
                  }
                />
              )}
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartContext,
  useChart,
}