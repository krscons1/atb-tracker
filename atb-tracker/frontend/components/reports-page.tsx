"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Clock, Target, Activity, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { fetchPomodoroSessions, PomodoroSession } from "@/utils/pomodoro-api"

export function ReportsPage() {
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly">("weekly")

  // 1. Load user projects and time entries from backend (persistent)
  const [projects, setProjects] = useState<any[]>([])
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true)
      try {
        // Fetch projects from backend
        const projectsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api"}/projects/`)
        const projectsData = projectsRes.ok ? await projectsRes.json() : []
        setProjects(projectsData)
        // Fetch time entries from backend
        const timeRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api"}/projects/time-entries/`)
        const timeData = timeRes.ok ? await timeRes.json() : []
        setTimeEntries(timeData)
        // Fetch pomodoro sessions from backend
        const pomodorosData = await fetchPomodoroSessions()
        setPomodoroSessions(pomodorosData)
        // Optionally cache to localStorage for offline fallback
        if (typeof window !== "undefined") {
          localStorage.setItem("userProjects", JSON.stringify(projectsData))
          localStorage.setItem("timeEntries", JSON.stringify(timeData))
          localStorage.setItem("pomodoroSessions", JSON.stringify(pomodorosData))
        }
      } catch (e: any) {
        setError("Failed to fetch data from backend. Showing cached data.")
        if (typeof window !== "undefined") {
          const savedProjects = localStorage.getItem("userProjects")
          setProjects(savedProjects ? JSON.parse(savedProjects) : [])
          const savedEntries = localStorage.getItem("timeEntries")
          setTimeEntries(savedEntries ? JSON.parse(savedEntries) : [])
          const savedPomodoros = localStorage.getItem("pomodoroSessions")
          setPomodoroSessions(savedPomodoros ? JSON.parse(savedPomodoros) : [])
        }
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  // 2. Aggregate data for reports
  // Helper: group entries by day/week/month
  function groupEntries(entries: any[], period: "daily" | "weekly" | "monthly") {
    const groups: Record<string, any> = {}
    entries.forEach(entry => {
      const date = new Date(entry.date)
      let key = ""
      if (period === "daily") {
        key = date.toISOString().split("T")[0]
      } else if (period === "weekly") {
        // Get week number of year
        const firstDay = new Date(date.getFullYear(), 0, 1)
        const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000))
        const week = Math.ceil((days + firstDay.getDay() + 1) / 7)
        key = `${date.getFullYear()}-W${week}`
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
      }
      if (!groups[key]) groups[key] = { hours: 0, pomodoros: 0, tasks: 0, key }
      groups[key].hours += entry.duration / 60
      groups[key].pomodoros += entry.pomodoros || 0
      groups[key].tasks += entry.tasks || 0
    })
    return Object.values(groups)
  }

  // Pomodoro aggregation for reports
  function groupPomodoroEntries(entries: PomodoroSession[], period: "daily" | "weekly" | "monthly") {
    const groups: Record<string, any> = {}
    entries.forEach(entry => {
      const date = new Date(entry.start_time)
      let key = ""
      if (period === "daily") {
        key = date.toISOString().split("T")[0]
      } else if (period === "weekly") {
        const firstDay = new Date(date.getFullYear(), 0, 1)
        const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000))
        const week = Math.ceil((days + firstDay.getDay() + 1) / 7)
        key = `${date.getFullYear()}-W${week}`
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
      }
      if (!groups[key]) groups[key] = { pomodoros: 0, key }
      groups[key].pomodoros += 1
    })
    return Object.values(groups)
  }

  // 3. Prepare data for charts
  const currentData = groupEntries(timeEntries, timePeriod)
  const pomodoroChartData = groupPomodoroEntries(pomodoroSessions, timePeriod)

  // 4. Project time distribution
  const projectHours: Record<string, number> = {}
  timeEntries.forEach(entry => {
    if (!projectHours[entry.project]) projectHours[entry.project] = 0
    projectHours[entry.project] += entry.duration / 60
  })
  const projectData = Object.entries(projectHours).map(([name, hours], i) => ({
    name,
    hours,
    color: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"][i % 5],
  }))

  // 5. Key metrics
  const totalHours = timeEntries.reduce((sum, e) => sum + e.duration, 0) / 60
  const totalPomodoros = pomodoroSessions.length
  // Fetch completed tasks count from backend
  // Show completed projects as 'Tasks Completed'
  const [completedProjects, setCompletedProjects] = useState<number | null>(null)
  const [loadingCompletedProjects, setLoadingCompletedProjects] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadCompletedProjects() {
      setLoadingCompletedProjects(true)
      try {
        const count = await import("@/utils/projects-api").then(mod => mod.fetchCompletedProjectCount())
        if (mounted) setCompletedProjects(count)
      } catch (e) {
        if (mounted) setCompletedProjects(0)
      } finally {
        if (mounted) setLoadingCompletedProjects(false)
      }
    }
    loadCompletedProjects()
    return () => { mounted = false }
  }, [])

  const totalTasks = timeEntries.reduce((sum, e) => sum + (e.tasks || 0), 0)
  const avgFocus = totalHours && timeEntries.length ? Math.round((totalHours * 60) / timeEntries.length) : 0

  const chartConfig = {
    hours: {
      label: "Hours",
      color: "#8b5cf6",
    },
    pomodoros: {
      label: "Pomodoros",
      color: "#06b6d4",
    },
    tasks: {
      label: "Tasks",
      color: "#10b981",
    },
  }

  // Productivity Trends from Pomodoro Sessions
  function getPomodoroTrends(entries: PomodoroSession[], period: "daily" | "weekly" | "monthly") {
    const groups: Record<string, { efficiency: number; focus: number; completion: number; count: number; key: string }> = {}
    entries.forEach(entry => {
      const date = new Date(entry.start_time)
      let key = ""
      if (period === "daily") {
        key = date.toISOString().split("T")[0]
      } else if (period === "weekly") {
        const firstDay = new Date(date.getFullYear(), 0, 1)
        const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000))
        const week = Math.ceil((days + firstDay.getDay() + 1) / 7)
        key = `${date.getFullYear()}-W${week}`
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
      }
      if (!groups[key]) groups[key] = { efficiency: 0, focus: 0, completion: 0, count: 0, key }
      groups[key].efficiency += 1 // Number of Pomodoros
      groups[key].focus += entry.duration || 0 // Sum durations
      groups[key].count += 1
      groups[key].completion = 100 // Assume 100% for now
    })
    // Calculate average focus
    Object.values(groups).forEach(g => {
      g.focus = g.count ? Math.round(g.focus / g.count) : 0
    })
    return Object.values(groups)
  }
  const pomodoroTrendsData = getPomodoroTrends(pomodoroSessions, timePeriod)

  // Task Completion Analysis: tasks = completed projects, hours = total hours worked per period
  function getTaskCompletionData(entries: any[], completedProjects: number | null, period: "daily" | "weekly" | "monthly") {
    const groups: Record<string, { tasks: number; hours: number; key: string }> = {}
    entries.forEach(entry => {
      const date = new Date(entry.date)
      let key = ""
      if (period === "daily") {
        key = date.toISOString().split("T")[0]
      } else if (period === "weekly") {
        const firstDay = new Date(date.getFullYear(), 0, 1)
        const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000))
        const week = Math.ceil((days + firstDay.getDay() + 1) / 7)
        key = `${date.getFullYear()}-W${week}`
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
      }
      if (!groups[key]) groups[key] = { tasks: 0, hours: 0, key }
      groups[key].hours += entry.duration / 60
    })
    // Assign completed projects to the latest period (or spread if possible)
    if (completedProjects && Object.keys(groups).length > 0) {
      // Assign all completed projects to the latest period
      const latestKey = Object.keys(groups).sort().reverse()[0]
      groups[latestKey].tasks = completedProjects
    }
    return Object.values(groups)
  }
  const taskCompletionData = getTaskCompletionData(timeEntries, completedProjects, timePeriod)

  return (
    <>
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
            <p className="text-gray-600">Track your productivity and analyze your work patterns</p>
          </div>
        </div>
      </header>

      {/* Time Period Filter */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium">View by:</span>
          {["daily", "weekly", "monthly"].map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod(period as "daily" | "weekly" | "monthly")}
              className={
                timePeriod === period
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "text-purple-600 border-purple-600 hover:bg-purple-50"
              }
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-full mx-auto space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {/* You can add a comparison to previous period here if desired */}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pomodoros</CardTitle>
                <Timer className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalPomodoros}</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle> {/* Actually completed projects */}
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
  {loadingCompletedProjects ? (
    <span className="animate-pulse">...</span>
  ) : (
    completedProjects
  )}
</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Focus Time</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{avgFocus}m</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Time Tracking Chart */}
            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle>Time Tracking Overview</CardTitle>
                <CardDescription>Hours worked per {timePeriod === "monthly" ? "week" : "day"}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={timePeriod === "monthly" ? "week" : "day"} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Pomodoro Sessions Chart */}
            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle>Pomodoro Sessions</CardTitle>
                <CardDescription>Number of completed pomodoro sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pomodoroChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={timePeriod === "monthly" ? "week" : "day"} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="pomodoros" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Project Time Distribution */}
            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle>Time by Project</CardTitle>
                <CardDescription>Hours spent on different projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="hours"
                      >
                        {projectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-gray-600">{data.hours}h</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {projectData.map((project, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                        <span>{project.name}</span>
                      </div>
                      <span className="font-medium">{project.hours}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Productivity Trends */}
            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle>Productivity Trends</CardTitle>
                <CardDescription>Efficiency, focus, and completion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                {pomodoroTrendsData.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">No productivity data yet, matey!</div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pomodoroTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={timePeriod === "monthly" ? "week" : timePeriod === "weekly" ? "week" : "key"} />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }} />
                        <Line type="monotone" dataKey="focus" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }} />
                        <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Completion Chart */}
          <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Task Completion Analysis</CardTitle>
              <CardDescription>Tasks completed vs hours worked correlation</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div>
                {taskCompletionData.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">No task completion data yet, matey!</div>
                ) : (
                  <div style={{ width: '100%', height: '300px' }}>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={taskCompletionData} 
                          barCategoryGap={taskCompletionData.length > 1 ? "20%" : "50%"}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey={timePeriod === "monthly" ? "week" : timePeriod === "weekly" ? "week" : "key"} 
                            label={{ value: "Period", position: "insideBottom", offset: -5 }} 
                          />
                          <YAxis 
                            yAxisId="left" 
                            label={{ value: "Tasks Completed", angle: -90, position: "insideLeft" }} 
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            label={{ value: "Hours Worked", angle: 90, position: "insideRight" }} 
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            wrapperStyle={{ paddingTop: 16 }} 
                            iconType="circle" 
                          />
                          <ChartTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div style={{ 
                                    background: "#fff", 
                                    border: "1px solid #eee", 
                                    borderRadius: 8, 
                                    padding: 12, 
                                    boxShadow: "0 2px 8px #0001" 
                                  }}>
                                    <div><strong>Period:</strong> {payload[0].payload.key}</div>
                                    <div style={{ color: "#10b981" }}>
                                      <strong>Tasks:</strong> {payload[0].payload.tasks}
                                    </div>
                                    <div style={{ color: "#8b5cf6" }}>
                                      <strong>Hours:</strong> {payload[0].payload.hours.toFixed(1)}
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }} 
                          />
                          <Bar 
                            yAxisId="left" 
                            dataKey="tasks" 
                            fill="#10b981" 
                            radius={[4, 4, 0, 0]} 
                            name="Tasks Completed" 
                          />
                          <Line 
                            yAxisId="right" 
                            type="monotone" 
                            dataKey="hours" 
                            stroke="#8b5cf6" 
                            strokeWidth={3} 
                            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }} 
                            name="Hours Worked" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
