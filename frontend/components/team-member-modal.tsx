"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { TeamMember } from "../types";

interface TeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (member: TeamMember) => void | Promise<void>
  member?: TeamMember | null
}

export function TeamMemberModal({ isOpen, onClose, onSave, member }: TeamMemberModalProps) {
  const [formData, setFormData] = useState<TeamMember>({
    id: member?.id || Date.now().toString(),
    name: member?.name || "",
    email: member?.email || "",
    rate: member?.rate || "-",
    cost: member?.cost || "-",
    workHours: member?.workHours || "-",
    accessRights: member?.accessRights || "Standard",
    groups: member?.groups || [],
  })

  const [memberNameSuggestions, setMemberNameSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const savedMembers = localStorage.getItem('members')
      if (savedMembers) {
        const members = JSON.parse(savedMembers)
        setMemberNameSuggestions(Array.from(new Set(members.map((m: any) => m.name).filter(Boolean))))
      } else {
        setMemberNameSuggestions([])
      }
    }
  }, [isOpen])

  const handleInputChange = (field: keyof TeamMember, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      id: prev.id || Date.now().toString(), // Always ensure id is set
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({ ...formData, id: member?.id ?? formData.id ?? Date.now().toString() })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{member ? "Edit Member" : "Add Member"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
              required
              list="member-name-suggestions"
            />
            <datalist id="member-name-suggestions">
              {memberNameSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
                Rate ($/hour)
              </Label>
              <Input
                id="rate"
                type="text"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Cost ($/hour)
              </Label>
              <Input
                id="cost"
                type="text"
                value={formData.cost}
                onChange={(e) => handleInputChange("cost", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="workHours" className="block text-sm font-medium text-gray-700 mb-1">
              Work Hours
            </Label>
            <Input
              id="workHours"
              type="text"
              placeholder="e.g. Mon-Fri 9:00-17:00"
              value={formData.workHours}
              onChange={(e) => handleInputChange("workHours", e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="accessRights" className="block text-sm font-medium text-gray-700 mb-1">
              Access Rights
            </Label>
            <Select value={formData.accessRights} onValueChange={(value) => handleInputChange("accessRights", value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Organization Owner">Organization Owner</SelectItem>
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
