"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/databasetypes";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { LoadingSection } from "@/components/ui/LoadingSection";
import {
  Users,
  MessageSquare,
  BarChart3,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────
type ClassStats = Database["public"]["Views"]["teacher_class_stats"]["Row"];
type DailyAnalytics =
  Database["public"]["Views"]["teacher_analytics_daily"]["Row"];
type WeeklyAnalytics =
  Database["public"]["Views"]["teacher_analytics_weekly"]["Row"];
type MonthlyAnalytics =
  Database["public"]["Views"]["teacher_analytics_monthly"]["Row"];

type TimeRange = "daily" | "weekly" | "monthly";

const TIME_RANGE_CONFIG: Record<
  TimeRange,
  { label: string; view: string; dateFormat: (d: string) => string }
> = {
  daily: {
    label: "Daily",
    view: "teacher_analytics_daily",
    dateFormat: (d: string) => {
      const date = new Date(d);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    },
  },
  weekly: {
    label: "Weekly",
    view: "teacher_analytics_weekly",
    dateFormat: (d: string) => {
      const date = new Date(d);
      return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    },
  },
  monthly: {
    label: "Monthly",
    view: "teacher_analytics_monthly",
    dateFormat: (d: string) => {
      const date = new Date(d);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    },
  },
};

// ── Main Component ─────────────────────────────────────────────────────────────
export function TeacherAnalytics() {
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [chartData, setChartData] = useState<
    (DailyAnalytics | WeeklyAnalytics | MonthlyAnalytics)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  // Fetch class stats on mount
  useEffect(() => {
    async function fetchClassStats() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("teacher_class_stats")
          .select("*")
          .eq("teacher_id", user.id);

        if (error) throw error;
        setClassStats((data as ClassStats[]) || []);
      } catch (err) {
        console.error("Error fetching class stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClassStats();
  }, []);

  // Fetch chart data when time range changes
  useEffect(() => {
    async function fetchChartData() {
      setChartLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const viewName = TIME_RANGE_CONFIG[timeRange].view as
          | "teacher_analytics_daily"
          | "teacher_analytics_weekly"
          | "teacher_analytics_monthly";

        const { data, error } = await supabase
          .from(viewName)
          .select("*")
          .eq("teacher_id", user.id)
          .order("date_group", { ascending: true });

        if (error) throw error;
        setChartData(data || []);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setChartLoading(false);
      }
    }

    fetchChartData();
  }, [timeRange]);

  // ── Derived stats ──
  const totalStudents = classStats.reduce(
    (sum, c) => sum + (c.total_students ?? 0),
    0,
  );
  const totalQueries = classStats.reduce(
    (sum, c) => sum + (c.total_queries ?? 0),
    0,
  );

  if (loading) {
    return <LoadingSection text="Loading analytics" />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ── Section 1: Overview Stats + Class Table ── */}
      <OverviewSection
        classStats={classStats}
        totalStudents={totalStudents}
        totalQueries={totalQueries}
      />

      {/* ── Section 2: Query Trends Chart ── */}
      <QueryTrendsSection
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        chartData={chartData}
        chartLoading={chartLoading}
      />

      {/* ── Section 3: Coming Soon ── */}
      <div className="bg-card rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 border border-border/40 pt-5 pb-3">
          <Sparkles className="w-4 h-4 text-ring" />
          <h2 className="text-sm font-semibold text-primary">AI Insights</h2>
        </div>
        <ComingSoon
          text="AI-powered analytics are coming soon — get smart insights about student engagement, question patterns, and class performance."
          icon={Sparkles}
        />
      </div>
    </div>
  );
}

// ── Section 1: Overview Stats + Class Breakdown Table ──────────────────────────
function OverviewSection({
  classStats,
  totalStudents,
  totalQueries,
}: {
  classStats: ClassStats[];
  totalStudents: number;
  totalQueries: number;
}) {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-ring" />
        <h2 className="text-sm font-semibold text-primary">Overview</h2>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-3 rounded-lg border border-border/40 px-4 py-3 bg-muted/30">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-ring/10">
            <Users className="w-4.5 h-4.5 text-ring" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-bold text-primary tabular-nums">
              {totalStudents}
            </p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/40 px-4 py-3 bg-muted/30">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-ring/10">
            <MessageSquare className="w-4.5 h-4.5 text-ring" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-bold text-primary tabular-nums">
              {totalQueries}
            </p>
            <p className="text-xs text-muted-foreground">Total Queries</p>
          </div>
        </div>
      </div>

      {/* Class breakdown table */}
      {classStats.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border/40">
          <table className="w-full text-[11px] sm:text-[13px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase sm:tracking-wider">
                  Class
                </th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase sm:tracking-wider hidden sm:table-cell">
                  Level
                </th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase sm:tracking-wider">
                  Students
                </th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase sm:tracking-wider">
                  Queries
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {classStats.map((cls) => (
                <tr
                  key={cls.class_id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="py-2.5 px-4 font-medium text-primary">
                    <div className="flex items-center gap-2">
                      {cls.class_name}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell">
                    {cls.class_level
                      ? cls.class_level.charAt(0).toUpperCase() +
                        cls.class_level.slice(1).replace("-", " ")
                      : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-primary">
                    {cls.total_students ?? 0}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-primary">
                    {cls.total_queries ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {classStats.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No class data available yet.
        </p>
      )}
    </div>
  );
}

// ── Section 2: Query Trends Line Chart ─────────────────────────────────────────
function QueryTrendsSection({
  timeRange,
  onTimeRangeChange,
  chartData,
  chartLoading,
}: {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  chartData: (DailyAnalytics | WeeklyAnalytics | MonthlyAnalytics)[];
  chartLoading: boolean;
}) {
  const config = TIME_RANGE_CONFIG[timeRange];

  const formattedData = chartData.map((d) => ({
    label: d.date_group ? config.dateFormat(d.date_group) : "",
    queries: d.total_queries ?? 0,
  }));

  return (
    <div className="bg-card border border-border/40 rounded-xl p-5">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-ring" />
          <h2 className="text-sm font-semibold text-primary">Query Trends</h2>
        </div>

        {/* Time range toggle */}
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/40">
          {(Object.keys(TIME_RANGE_CONFIG) as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                timeRange === range
                  ? "bg-card text-primary shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {TIME_RANGE_CONFIG[range].label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="h-[280px] sm:h-[320px]">
        {chartLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-ring/30 border-t-ring rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        ) : formattedData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-8 h-8" />
              <p className="text-sm">No data available for this time range.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                dy={8}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="queries"
                stroke="#2ca4ab"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#2ca4ab", strokeWidth: 0 }}
                activeDot={{
                  r: 5.5,
                  fill: "#2ca4ab",
                  stroke: "var(--card)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card border border-border/60 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-primary tabular-nums">
        {payload[0].value} {payload[0].value === 1 ? "query" : "queries"}
      </p>
    </div>
  );
}
