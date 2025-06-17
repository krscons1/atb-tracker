"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"


interface TeamGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (group: TeamGroup) => void | Promise<void>
  group?: TeamGroup | null
}

export function TeamGroupModal({ isOpen, onClose, onSave, group }: TeamGroupModalProps) {
  const [formData, setFormData] = useState<TeamGroup>({
    name: group?.name || "",
    access: group?.access || "Standard",
  })
  const [groupNameSuggestions, setGroupNameSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const savedGroups = localStorage.getItem('groups')
      if (savedGroups) {
        const groups = JSON.parse(savedGroups)
        setGroupNameSuggestions(Array.from(new Set(groups.map((g: any) => g.name).filter(Boolean))))
      } else {
        setGroupNameSuggestions([])
      }
    }
  }, [isOpen])

  const handleInputChange = (field: keyof TeamGroup, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: group?.id })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{group ? "Edit Group" : "Add Group"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
              required
              list="group-name-suggestions"
            />
            <datalist id="group-name-suggestions">
              {groupNameSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="access" className="block text-sm font-medium text-gray-700 mb-1">
              Access Level
            </Label>
            <Select value={formData.access} onValueChange={(value) => handleInputChange("access", value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Project Manager">Project Manager</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Limited">Limited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6">
              SAVE
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
