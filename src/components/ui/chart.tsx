"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";

import { cn } from "@/lib/utils";

// Format: https://github.com/recharts/recharts/blob/master/src/component/DefaultTooltipContent.tsx

const ChartContext = React.createContext<{
  color?: string;
}>({});

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    id?: string; // Explicitly define id as an optional prop
  }
>(({ id: propId, className, children, ...props }, ref) => { // Renomeado 'id' para 'propId'
  const uniqueId = React.useId(); // Usando React.useId para gerar um ID único
  const chartId = `chart-${propId || uniqueId}`; // Usando 'propId'

  return (
    <ChartContext.Provider value={{}}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} />
        {children}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id }: { id: string }) => {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          [data-chart=${id}] .recharts-text {
            font-family: var(--font-sans);
            font-size: var(--chart-text-size, 0.875rem);
          }
        `,
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  }
>(
  (
    {
      active,
      payload,
      label,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { color: contextColor } = React.useContext(ChartContext);

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !label) {
        return null;
      }

      let displayLabel = label;
      if (labelFormatter) {
        displayLabel = labelFormatter(label, payload ?? []);
      }

      return (
        <div className={cn("font-medium", labelClassName)}>
          {displayLabel}
        </div>
      );
    }, [hideLabel, label, labelFormatter, labelClassName, payload]);

    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const nestLabel = payload.length === 1 && !nameKey;
    const firstPayload = payload[0];
    const firstPayloadName = nameKey
      ? (firstPayload.payload as any)[nameKey]
      : firstPayload.name;

    return (
      <div
        ref={ref}
        className={cn(
          "border-border/50 bg-background/95 grid min-w-[8rem] overflow-hidden rounded-md border p-1.5 text-xs shadow-md",
          className
        )}
      >
        {!nestLabel && tooltipLabel}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const itemName = nameKey
              ? (item.payload as any)[nameKey]
              : item.name;
            const itemColor = color ?? item.color ?? contextColor;
            const itemLabel =
              labelKey && item.payload && typeof item.payload === "object"
                ? (item.payload as any)[labelKey]
                : itemName;

            return (
              <div
                key={item.dataKey ?? index}
                className={cn(
                  "flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {!hideIndicator && (
                  <div
                    className="shrink-0 rounded-[2px] border-[--color] bg-[--color]"
                    style={
                      {
                        "--color": itemColor,
                      } as React.CSSProperties
                    }
                  />
                )}
                <div
                  className={cn(
                    "flex flex-1 justify-between leading-none",
                    nestLabel ? "items-center" : "items-baseline"
                  )}
                >
                  <div className="grid gap-1.5">
                    {!nestLabel && (
                      <span className="text-muted-foreground">
                        {itemLabel}
                      </span>
                    )}
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {formatter && item.value !== undefined
                        ? formatter(item.value, item.name, item, index, item.payload)
                        : item.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltip";

// Helper to filter out tooltips without a value.
const hasValue = (payload: Payload<ValueType, NameType>): payload is {
  value: ValueType;
} & Payload<ValueType, NameType> => {
  return payload.value !== undefined && payload.value !== null;
};

const ChartLegend = RechartsPrimitive.Legend;

const Chart = {
  ...RechartsPrimitive,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
};

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
};