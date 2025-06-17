"use client"

import type React from "react"
import { useState } from "react"
import { X, Clock, Users, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export interface Reminder {
  id?: string
  title: string
  description: string
  frequency: "once" | "daily" | "weekly" | "monthly"
  time: string
  date?: string
  dayOfWeek?: string
  dayOfMonth?: string
  teamMembers: string[]
  notifyBy: ("email" | "notification")[]
}

interface ReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (reminder: Reminder) => void
  reminder?: Reminder | null
  teamMembers: { id: string; name: string }[]
}

export function ReminderModal({ isOpen, onClose, onSave, reminder, teamMembers }: ReminderModalProps) {
  const [formData, setFormData] = useState<Reminder>(
    reminder || {
      title: "",
      description: "",
      frequency: "once",
      time: "09:00",
      teamMembers: [],
      notifyBy: ["email", "notification"],
    },
  )

  const handleInputChange = <K extends keyof Reminder>(field: K, value: Reminder[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTeamMemberToggle = (memberId: string) => {
    setFormData((prev) => {
      if (prev.teamMembers.includes(memberId)) {
        return {
          ...prev,
          teamMembers: prev.teamMembers.filter((id) => id !== memberId),
        }
      } else {
        return {
          ...prev,
          teamMembers: [...prev.teamMembers, memberId],
        }
      }
    })
  }

  const handleNotifyByToggle = (method: "email" | "notification") => {
    setFormData((prev) => {
      if (prev.notifyBy.includes(method)) {
        return {
          ...prev,
          notifyBy: prev.notifyBy.filter((m) => m !== method),
        }
      } else {
        return {
          ...prev,
          notifyBy: [...prev.notifyBy, method],
        }
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: reminder?.id })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{reminder ? "Edit Reminder" : "Add Reminder"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Title
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full"
              placeholder="e.g. Submit weekly timesheet"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full min-h-[80px]"
              placeholder="Add details about this reminder"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Frequency</Label>
            <RadioGroup
              value={formData.frequency}
              onValueChange={(value) => handleInputChange("frequency", value as Reminder["frequency"])}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="once" id="once" />
                <Label htmlFor="once" className="cursor-pointer">
                  Once
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="cursor-pointer">
                  Daily
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="cursor-pointer">
                  Weekly
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="cursor-pointer">
                  Monthly
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.frequency === "once" && (
            <div>
              <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ""}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full"
                required
              />
            </div>
          )}

          {formData.frequency === "weekly" && (
            <div>
              <Label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </Label>
              <Select
                value={formData.dayOfWeek || "1"}
                onValueChange={(value) => handleInputChange("dayOfWeek", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.frequency === "monthly" && (
            <div>
              <Label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700 mb-1">
                Day of Month
              </Label>
              <Select
                value={formData.dayOfMonth || "1"}
                onValueChange={(value) => handleInputChange("dayOfMonth", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </Label>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="w-full"
                required
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Team Members</Label>
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Select who should receive this reminder</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={formData.teamMembers.includes(member.id)}
                    onCheckedChange={() => handleTeamMemberToggle(member.id)}
                  />
                  <Label htmlFor={`member-${member.id}`} className="cursor-pointer">
                    {member.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Notify By</Label>
            <div className="flex items-center mb-2">
              <Bell className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">How should team members be notified?</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-email"
                  checked={formData.notifyBy.includes("email")}
                  onCheckedChange={() => handleNotifyByToggle("email")}
                />
                <Label htmlFor="notify-email" className="cursor-pointer">
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-notification"
                  checked={formData.notifyBy.includes("notification")}
                  onCheckedChange={() => handleNotifyByToggle("notification")}
                />
                <Label htmlFor="notify-notification" className="cursor-pointer">
                  In-app notification
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white px-6">
              Save Reminder
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
