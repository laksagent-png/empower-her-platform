import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { fetchImpactStats, updateImpactStats } from "@/services/firebase";
import type { ImpactMetric } from "@/types/firebase";
import { IMPACT_ICON_OPTIONS, IMPACT_ICONS, DEFAULT_ICON_KEY } from "@/constants/impactIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

/** Default metrics shown when no Firestore doc exists yet. */
const DEFAULT_METRICS: ImpactMetric[] = [
  { id: "1", label: "Women Empowered", value: 2500, suffix: "+", iconKey: "users" },
  { id: "2", label: "Workshops Held", value: 85, suffix: "", iconKey: "book-open" },
  { id: "3", label: "Districts Reached", value: 18, suffix: "", iconKey: "map-pin" },
  { id: "4", label: "Job Placements", value: 340, suffix: "+", iconKey: "target" },
];

function newMetric(): ImpactMetric {
  return {
    id: crypto.randomUUID(),
    label: "",
    value: 0,
    suffix: "",
    iconKey: DEFAULT_ICON_KEY,
  };
}

const ImpactSettingsEditor = () => {
  const queryClient = useQueryClient();

  const { data: impactDoc, isLoading } = useQuery({
    queryKey: ["impact-stats"],
    queryFn: fetchImpactStats,
  });

  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Initialise local state from server data (or defaults)
  const serverMetrics =
    impactDoc?.metrics && impactDoc.metrics.length > 0
      ? impactDoc.metrics
      : DEFAULT_METRICS;

  // Use server metrics as initial value; track local edits separately
  const effectiveMetrics = isDirty ? metrics : serverMetrics;

  const saveMutation = useMutation({
    mutationFn: () =>
      updateImpactStats({ metrics: effectiveMetrics }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["impact-stats"] });
      setIsDirty(false);
      toast({ title: "Impact Metrics Saved", description: "Impact metrics updated successfully." });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save impact metrics. Please try again.",
        variant: "destructive",
      });
    },
  });

  const update = (updater: (prev: ImpactMetric[]) => ImpactMetric[]) => {
    setMetrics((prev) => updater(isDirty ? prev : serverMetrics));
    setIsDirty(true);
  };

  const addMetric = () => update((prev) => [...prev, newMetric()]);

  const removeMetric = (id: string) =>
    update((prev) => prev.filter((m) => m.id !== id));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    update((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    update((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const updateMetricField = <K extends keyof ImpactMetric>(
    id: string,
    field: K,
    value: ImpactMetric[K]
  ) => {
    update((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Loading impact metrics…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Impact Metrics
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={addMetric}>
          <Plus size={14} className="mr-1" /> Add Metric
        </Button>
      </div>

      <div className="space-y-3">
        {effectiveMetrics.map((metric, idx) => {
          const IconOption =
            IMPACT_ICONS[metric.iconKey] ?? IMPACT_ICONS[DEFAULT_ICON_KEY];
          const PreviewIcon = IconOption.Icon;

          return (
            <div
              key={metric.id}
              className="flex flex-col gap-2 border border-border rounded-lg p-3 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center shrink-0">
                    <PreviewIcon size={16} className="text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Metric #{idx + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0}
                    onClick={() => moveUp(idx)}
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === effectiveMetrics.length - 1}
                    onClick={() => moveDown(idx)}
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMetric(metric.id)}
                    aria-label="Remove metric"
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Label */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Label
                  </label>
                  <Input
                    value={metric.label}
                    placeholder="e.g. Women Empowered"
                    onChange={(e) =>
                      updateMetricField(metric.id, "label", e.target.value)
                    }
                  />
                </div>

                {/* Value */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Value
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={metric.value}
                    placeholder="e.g. 2500"
                    onChange={(e) =>
                      updateMetricField(
                        metric.id,
                        "value",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </div>

                {/* Suffix */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Suffix (optional)
                  </label>
                  <Input
                    value={metric.suffix ?? ""}
                    placeholder='e.g. "+" or "k+"'
                    maxLength={10}
                    onChange={(e) =>
                      updateMetricField(metric.id, "suffix", e.target.value)
                    }
                  />
                </div>

                {/* Icon */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Icon
                  </label>
                  <Select
                    value={metric.iconKey}
                    onValueChange={(v) =>
                      updateMetricField(metric.id, "iconKey", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <span className="flex items-center gap-2">
                          <PreviewIcon size={14} />
                          <span className="truncate">{IconOption.label}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {IMPACT_ICON_OPTIONS.map(({ key, label, Icon }) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <Icon size={14} />
                            <span>{label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {effectiveMetrics.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No metrics yet. Click "Add Metric" to get started.
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="gradient-warm text-primary-foreground"
        >
          {saveMutation.isPending ? "Saving…" : "Save Metrics"}
        </Button>
      </div>
    </div>
  );
};

export default ImpactSettingsEditor;
