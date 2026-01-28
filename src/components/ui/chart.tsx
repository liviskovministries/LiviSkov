import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContext = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContext | null>(null)

// Create a wrapper div that properly handles the Recharts container
interface ChartWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  chartId: string
  children: React.ReactNode
}

const ChartWrapper = React.forwardRef<HTMLDivElement, ChartWrapperProps>(
  ({ config, chartId, className, children, ...props }, ref) => {
    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          data-chart={chartId}
          className={cn(
            "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
            typeof className === 'string' ? className : ''
          )}
          {...props}
        >
          {children}
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartWrapper.displayName = "ChartWrapper"

function Chart({
  id,
  className,
  config,
  children,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  config: ChartConfig
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
  
  // Handle className prop that might be string | number | undefined
  const chartClassName = typeof className === 'string' ? className : undefined

  return (
    <ChartWrapper config={config} chartId={chartId} className={chartClassName} {...props}>
      {children}
    </ChartWrapper>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  className?: string
  labelFormatter?: (label: string, payload: any[]) => React.ReactNode
  formatter?: (value: any, name: string, props: any) => [React.ReactNode, string?]
  color?: string
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  labelFormatter,
  formatter,
  color,
}: ChartTooltipContentProps) {
  const { config } = React.useContext(ChartContext)!

  if (!active || !payload?.length) {
    return null
  }

  const items = payload.map((item) => {
    const key = `${item.name || item.dataKey}`
    const itemConfig = config[key]

    const [value, formattedName] = formatter
      ? formatter(item.value, item.name || '', item)
      : [item.value, itemConfig?.label || item.name || '']

    return {
      name: formattedName,
      value: value,
      color: color || item.color || itemConfig?.color,
      icon: itemConfig?.icon,
    }
  })

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {label ? (
        <div className="text-muted-foreground">
          {labelFormatter ? labelFormatter(label, items) : label}
        </div>
      ) : null}
      {items.map((item, index) => (
        <div key={`${item.name}-${index}`} className="flex w-full items-stretch gap-2">
          {item.icon && (
            <div
              className="flex items-center"
              style={{ color: item.color }}
            >
              <item.icon />
            </div>
          )}
          <div className="flex flex-1 justify-between leading-none">
            <span>{item.name}</span>
            <span className="text-foreground font-mono font-medium tabular-nums">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

interface ChartLegendContentProps extends React.HTMLAttributes<HTMLDivElement> {
  payload?: any[]
  iconSize?: number
}

// Create a typed wrapper for the legend content
const ChartLegendContentWrapper = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ className, payload, iconSize = 14, ...props }, ref) => {
    const { config } = React.useContext(ChartContext)!

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-4", className)}
        {...props}
      >
        {payload.map((item) => {
          const key = `${item.value}`
          const itemConfig = config[key]

          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color ?? itemConfig?.color,
                }}
              />
              {itemConfig?.icon && (
                <itemConfig.icon />
              )}
              {item.value}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContentWrapper.displayName = "ChartLegendContent"

// Export the properly typed component
function ChartLegendContent(props: ChartLegendContentProps) {
  return <ChartLegendContentWrapper {...props} />
}

ChartLegendContent.displayName = "ChartLegendContent"

// Helper components.
function ChartStyle({
  selector = "[data-chart]",
  id,
  config,
}: {
  selector?: string
  id?: string
  config: ChartConfig
}) {
  const uniqueId = React.useId()
  const chartId = id || uniqueId.replace(/:/g, "")

  const css = Object.entries(config).map(([key, itemConfig]) => {
    if (!itemConfig) {
      return ""
    }

    const color = itemConfig.theme
      ? Object.entries(itemConfig.theme)
          .map(([theme, color]) => {
            const selector = THEMES[theme as keyof typeof THEMES]
            return `${selector} [data-chart=${chartId}] .recharts-${key} { ${color} }`
          })
          .join("\n")
      : `[data-chart=${chartId}] .recharts-${key} { ${itemConfig.color} }`

    return color
  })

  return <style dangerouslySetInnerHTML={{ __html: css.join("\n") }} />
}

export {
  Chart,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  THEMES,
}