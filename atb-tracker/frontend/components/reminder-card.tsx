"use client"

import { Calendar, Clock, Bell, Users, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Reminder } from "./reminder-modal"

interface ReminderCardProps {
  reminder: Reminder
  onEdit: (reminder: Reminder) => void
  onDelete: (id: string) => void
  teamMembers: { id: string; name: string }[]
}

export function ReminderCard({ reminder, onEdit, onDelete, teamMembers }: ReminderCardProps) {
  const getFrequencyText = () => {
    switch (reminder.frequency) {
      case "once":
        return `Once on ${reminder.date}`
      case "daily":
        return "Daily"
      case "weekly":
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return `Weekly on ${days[Number.parseInt(reminder.dayOfWeek || "1")]}`
      case "monthly":
        return `Monthly on day ${reminder.dayOfMonth}`
      default:
        return reminder.frequency
    }
  }

  const getTeamMemberNames = () => {
    return reminder.teamMembers
      .map((id) => teamMembers.find((member) => member.id === id)?.name || "Unknown")
      .join(", ")
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800 text-lg">{reminder.title}</h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-purple-600"
            onClick={() => onEdit(reminder)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
            onClick={() => onDelete(reminder.id || "")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {reminder.description && <p className="text-gray-600 text-sm mt-1 mb-3">{reminder.description}</p>}

      <div className="space-y-2 mt-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-purple-500" />
          <span>{getFrequencyText()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-purple-500" />
          <span>{reminder.time}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2 text-purple-500" />
          <span>{getTeamMemberNames() || "No team members selected"}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Bell className="h-4 w-4 mr-2 text-purple-500" />
          <span>
            {reminder.notifyBy.includes("email") && "Email"}
            {reminder.notifyBy.includes("email") && reminder.notifyBy.includes("notification") && " & "}
            {reminder.notifyBy.includes("notification") && "In-app notification"}
          </span>
        </div>
      </div>
    </div>
  )
}
