"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Trash2, Edit, DollarSign, Plus, Clock, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  fetchTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  TimeEntry as APITimeEntry
} from "../utils/time-entries-api"

interface TimeEntry {
  id: number
  project: number
  projectName: string
  projectColor: string
  description: string
  startTime: string
  endTime: string
  duration: number // in minutes
  date: string
  billable: boolean
}

type NewEntry = {
  project: number | "";
  description: string;
  startTime: string;
  endTime: string;
  billable: boolean;
};

interface Project {
  id: string
  name: string
  color: string
}

export function TimesheetView() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState<NewEntry>({
    project: "",
    description: "",
    startTime: "09:00",
    endTime: "17:00",
    billable: true,
  })
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)

  // Sample projects
  const projects: Project[] = [
    { id: "1", name: "Web Development", color: "bg-blue-500" },
    { id: "2", name: "Mobile App", color: "bg-green-500" },
    { id: "3", name: "Design Work", color: "bg-purple-500" },
    { id: "4", name: "Client Meeting", color: "bg-orange-500" },
    { id: "5", name: "Research", color: "bg-pink-500" },
  ]

  // Backend time entries
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)

  useEffect(() => {
    setLoadingEntries(true)
    fetchTimeEntries()
      .then((data: APITimeEntry[]) => {
        // Map API entries to local TimeEntry format
        setTimeEntries(
          data.map((entry) => {
            // Find project name/color from projects array
            const projectObj = projects.find((p) => String(p.id) === String(entry.project))
            return {
              id: entry.id!,
              project: entry.project,
              projectName: projectObj?.name || String(entry.project),
              projectColor: projectObj?.color || "bg-gray-500",
              description: entry.description,
              startTime: entry.start_time,
              endTime: entry.end_time,
              duration: entry.duration,
              date: entry.date,
              billable: entry.billable,
            }
          })
        )
      })
      .catch(() => setTimeEntries([]))
      .finally(() => setLoadingEntries(false))
  }, [])

  // Get dates for the current week
  const getDaysOfWeek = () => {
    const days = []
    const firstDayOfWeek = new Date(currentWeek)
    const day = firstDayOfWeek.getDay()
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1))

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek)
      date.setDate(firstDayOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }

  const weekDays = getDaysOfWeek()

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek)
    prevWeek.setDate(prevWeek.getDate() - 7)
    setCurrentWeek(prevWeek)
  }

  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek)
    nextWeek.setDate(nextWeek.getDate() + 7)
    setCurrentWeek(nextWeek)
  }

  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  // Calculate duration between start and end time
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    let durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)
    if (durationMinutes < 0) durationMinutes += 24 * 60

    return durationMinutes
  }

  // Format duration for display
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
  }

  // Get entries for a specific date
  const getEntriesForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return timeEntries.filter((entry) => entry.date === dateString)
  }

  // Calculate total duration for a date
  const getTotalDurationForDate = (date: Date) => {
    const entries = getEntriesForDate(date)
    return entries.reduce((total, entry) => total + entry.duration, 0)
  }

  // Calculate total duration for the week
  const getWeeklyTotal = () => {
    return timeEntries.reduce((total, entry) => {
      const entryDate = new Date(entry.date)
      const isInCurrentWeek = weekDays.some(
        (day) =>
          day.getDate() === entryDate.getDate() &&
          day.getMonth() === entryDate.getMonth() &&
          day.getFullYear() === entryDate.getFullYear(),
      )
      return isInCurrentWeek ? total + entry.duration : total
    }, 0)
  }

  // Handle adding a new time entry
  const handleAddEntry = async () => {
    if (!selectedDate || !newEntry.project || !newEntry.description || !newEntry.startTime || !newEntry.endTime) {
      return
    }

    const duration = calculateDuration(newEntry.startTime!, newEntry.endTime!)
    if (duration <= 0) return

    const selectedProject = projects.find((p) => p.name === newEntry.project)
    const projectId = selectedProject ? Number(selectedProject.id) : Number(newEntry.project)

    try {
      const created = await createTimeEntry({
        project: projectId,
        description: newEntry.description!,
        start_time: newEntry.startTime!,
        end_time: newEntry.endTime!,
        duration,
        date: selectedDate.toISOString().split("T")[0],
        billable: newEntry.billable || false,
      })
      setTimeEntries([
        ...timeEntries,
        {
          id: created.id!,
          project: created.project,
          projectName: selectedProject?.name || String(created.project),
          projectColor: selectedProject?.color || "bg-gray-500",
          description: created.description,
          startTime: created.start_time,
          endTime: created.end_time,
          duration: created.duration,
          date: created.date,
          billable: created.billable,
        },
      ])
      resetForm()
    } catch (e) {
      alert("Failed to add time entry")
    }
  }

  // Reset form
  const resetForm = () => {
    setNewEntry({
      project: "",
      description: "",
      startTime: "09:00",
      endTime: "17:00",
      billable: true,
    })
    setSelectedDate(null)
    setShowAddForm(false)
    setEditingEntryId(null)
  }

  // Handle editing an entry
  const startEditEntry = (entry: TimeEntry) => {
    setEditingEntryId(entry.id)
    setNewEntry({
      project: entry.project,
      description: entry.description,
      startTime: entry.startTime,
      endTime: entry.endTime,
      billable: entry.billable,
    })
    setSelectedDate(new Date(entry.date))
    setShowAddForm(true)
  }

  // Save edited entry
  const saveEditedEntry = async () => {
    if (!editingEntryId) return

    const duration = calculateDuration(newEntry.startTime!, newEntry.endTime!)
    if (duration <= 0) return

    const selectedProject = projects.find((p) => p.name === newEntry.project)
    const projectId = selectedProject ? Number(selectedProject.id) : Number(newEntry.project)

    try {
      const updated = await updateTimeEntry(editingEntryId, {
        project: projectId,
        description: newEntry.description!,
        start_time: newEntry.startTime!,
        end_time: newEntry.endTime!,
        duration,
        date: selectedDate?.toISOString().split("T")[0] || "",
        billable: newEntry.billable || false,
      })
      setTimeEntries(
        timeEntries.map((entry) =>
          entry.id === editingEntryId
            ? {
                id: updated.id!,
                project: updated.project,
                projectName: selectedProject?.name || String(updated.project),
                projectColor: selectedProject?.color || "bg-gray-500",
                description: updated.description,
                startTime: updated.start_time,
                endTime: updated.end_time,
                duration: updated.duration,
                date: updated.date,
                billable: updated.billable,
              }
            : entry
        )
      )
      resetForm()
    } catch (e) {
      alert("Failed to update time entry")
    }
  }

  // Delete an entry
  const deleteEntry = async (id: number) => {
    try {
      await deleteTimeEntry(id)
      setTimeEntries(timeEntries.filter((entry) => entry.id !== id))
    } catch (e) {
      alert("Failed to delete time entry")
    }
  }

  // Show add form for specific date
  const showAddFormForDate = (date: Date) => {
    setSelectedDate(date)
    setShowAddForm(true)
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Navigation */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="h-9 w-9 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToCurrentWeek} className="px-4">
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextWeek} className="h-9 w-9 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {weekDays[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h1>
                <p className="text-gray-600">
                  {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                  {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{formatDuration(getWeeklyTotal())}</div>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Time
              </Button>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingEntryId ? "Edit Time Entry" : "Add New Time Entry"}
                {selectedDate && (
                  <span className="text-base font-normal text-gray-600 ml-2">for {formatDate(selectedDate)}</span>
                )}
              </h3>
              <Button variant="ghost" size="sm" onClick={resetForm} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {!selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <Select
                    value={selectedDate?.toISOString().split("T")[0] || ""}
                    onValueChange={(value) => setSelectedDate(new Date(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day.toISOString()} value={day.toISOString().split("T")[0]}>
                          {formatDate(day)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className={selectedDate ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <Select
                  value={newEntry.project === "" ? "" : String(newEntry.project)}
                  onValueChange={(value) => setNewEntry({ ...newEntry, project: value === "" ? "" : Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${project.color} mr-2`}></div>
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={selectedDate ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Input
                  placeholder="What did you work on?"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start</label>
                <Input
                  type="time"
                  value={newEntry.startTime}
                  onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End</label>
                <Input
                  type="time"
                  value={newEntry.endTime}
                  onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                className={`flex items-center ${newEntry.billable ? "text-green-600" : "text-gray-400"}`}
                onClick={() => setNewEntry({ ...newEntry, billable: !newEntry.billable })}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                {newEntry.billable ? "Billable" : "Non-billable"}
              </Button>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={editingEntryId ? saveEditedEntry : handleAddEntry}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingEntryId ? "Save Changes" : "Add Entry"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Timesheet Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-semibold text-gray-700">Project & Task</div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-4 text-center font-semibold border-l border-gray-200 ${
                  isToday(day) ? "bg-purple-50 text-purple-700" : "text-gray-700"
                }`}
              >
                <div className="text-sm">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className="text-lg font-bold">{day.getDate()}</div>
                {isToday(day) && <Badge className="bg-purple-100 text-purple-700 text-xs mt-1">Today</Badge>}
              </div>
            ))}
          </div>

          {/* Time Entries Rows */}
          {timeEntries.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your time by adding your first entry</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Entry
              </Button>
            </div>
          ) : (
            <>
              {/* Group entries by project for better organization */}
              {Array.from(new Set(timeEntries.map((entry) => entry.project))).map((projectName) => {
                const projectEntries = timeEntries.filter((entry) => entry.project === projectName)
                const projectColor = projectEntries[0]?.projectColor || "bg-gray-500"

                return (
                  <div key={projectName} className="border-b border-gray-100 last:border-b-0">
                    {projectEntries.map((entry, entryIndex) => (
                      <div key={entry.id} className="grid grid-cols-8 hover:bg-gray-50 transition-colors group">
                        <div className="p-4 border-l-4" style={{ borderColor: projectColor.replace("bg-", "") }}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${projectColor}`}></div>
                            <div>
                              <div className="font-semibold text-gray-900">{entry.project}</div>
                              <div className="text-sm text-gray-600">{entry.description}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                {entry.billable && (
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Billable
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {weekDays.map((day, dayIndex) => {
                          const entryDate = new Date(entry.date)
                          const isEntryDay =
                            day.getDate() === entryDate.getDate() &&
                            day.getMonth() === entryDate.getMonth() &&
                            day.getFullYear() === entryDate.getFullYear()

                          return (
                            <div
                              key={dayIndex}
                              className={`p-4 text-center border-l border-gray-200 ${
                                isToday(day) ? "bg-purple-50" : ""
                              }`}
                            >
                              {isEntryDay ? (
                                <div className="relative">
                                  <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                                    <div className="text-sm font-medium text-gray-900">
                                      {entry.startTime} - {entry.endTime}
                                    </div>
                                    <div className="text-lg font-bold text-purple-600 mt-1">
                                      {formatDuration(entry.duration)}
                                    </div>
                                  </div>
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                      onClick={() => startEditEntry(entry)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                      onClick={() => deleteEntry(entry.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-300 hover:text-purple-600 hover:bg-purple-50"
                                  onClick={() => showAddFormForDate(day)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* Daily Totals Row */}
              <div className="grid grid-cols-8 bg-gray-50 border-t-2 border-gray-200">
                <div className="p-4 font-bold text-gray-900">Daily Total</div>
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={`p-4 text-center font-bold border-l border-gray-200 ${
                      isToday(day) ? "bg-purple-100 text-purple-700" : "text-gray-900"
                    }`}
                  >
                    {formatDuration(getTotalDurationForDate(day))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get week number
function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}
