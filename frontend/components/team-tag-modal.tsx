"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Tag } from "./team-page"

interface TeamTagModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tag: Tag) => void
  tag?: Tag | null
}

const colorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-orange-500", label: "Orange" },
]

export function TeamTagModal({ isOpen, onClose, onSave, tag }: TeamTagModalProps) {
  const [formData, setFormData] = useState<Tag>({
    id: tag?.id || "",
    name: tag?.name || "",
    color: tag?.color || "bg-blue-500",
    description: tag?.description || "",
  })

  const handleInputChange = (field: keyof Tag, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: tag?.id || "" })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{tag ? "Edit Tag" : "Add Tag"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tag Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full"
              rows={3}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Color</Label>
            <RadioGroup
              value={formData.color}
              onValueChange={(value) => handleInputChange("color", value)}
              className="grid grid-cols-4 gap-2"
            >
              {colorOptions.map((color) => (
                <div key={color.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={color.value} id={color.value} className="sr-only" />
                  <Label
                    htmlFor={color.value}
                    className={`flex items-center justify-center w-full h-8 rounded-md cursor-pointer border-2 ${
                      formData.color === color.value ? "border-gray-900" : "border-transparent"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${color.value}`}></div>
                    <span className="ml-2 text-xs">{color.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6">
              SAVE
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
