"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Project {
  id?: string
  name: string
  client: string
  status: "active" | "completed" | "on-hold" | "archived"
  budget: string
  spent: string
  hours: string
  teamMembers: string[]
  deadline: string
  progress: number
  description?: string
  isBillable: boolean
  billableRate: string
  template: string
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: Project) => void
  project?: Project | null
}

const templateOptions = ["Web Development", "Mobile App", "Design Project", "Consulting", "Marketing Campaign"]

export function ProjectModal({ isOpen, onClose, onSave, project }: ProjectModalProps) {
  const [formData, setFormData] = useState<Project>({
    name: project?.name || "",
    client: project?.client || "",
    status: project?.status || "active",
    budget: project?.budget || "",
    spent: project?.spent || "$0",
    hours: project?.hours || "0",
    teamMembers: project?.teamMembers || [],
    deadline: project?.deadline || "",
    progress: project?.progress || 0,
    description: project?.description || "",
    isBillable: project?.isBillable || false,
    billableRate: project?.billableRate || "0",
    template: project?.template || templateOptions[0],
  })

  const [projectNameSuggestions, setProjectNameSuggestions] = useState<string[]>([])
  const [clientNameSuggestions, setClientNameSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      // Get clients from projects
      const savedProjects = localStorage.getItem('userProjects');
      let projectClients: string[] = [];
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        projectClients = projects.map((p: any) => p.client).filter(Boolean);
      }

      // Get clients from clients list
      const savedClients = localStorage.getItem('clients');
      let clientList: string[] = [];
      if (savedClients) {
        const clients = JSON.parse(savedClients);
        clientList = clients.map((c: any) => c.name).filter(Boolean);
      }

      // Merge and deduplicate
      setClientNameSuggestions(Array.from(new Set([...projectClients, ...clientList])));
    }
  }, [isOpen])

  const handleInputChange = <K extends keyof Project>(field: K, value: Project[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTeamMemberAdd = (member: string) => {
    if (!formData.teamMembers.includes(member)) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, member],
      }))
    }
  }

  const handleTeamMemberRemove = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m !== member),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: project?.id })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{project ? "Edit Project" : "Add Project"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
              required
              list="project-name-suggestions"
            />
            <datalist id="project-name-suggestions">
              {projectNameSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </Label>
            <Input
              id="client"
              type="text"
              value={formData.client}
              onChange={(e) => handleInputChange("client", e.target.value)}
              className="w-full"
              required
              list="client-name-suggestions"
            />
            <datalist id="client-name-suggestions">
              {clientNameSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
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
              placeholder="Project description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value as Project["status"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-1">
                Progress (%)
              </Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleInputChange("progress", Number.parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </Label>
              <Input
                id="budget"
                type="text"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
                className="w-full"
                placeholder="$10,000"
              />
            </div>

            <div>
              <Label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </Label>
            <Select value={formData.template} onValueChange={(value) => handleInputChange("template", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templateOptions.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isBillable" className="block text-sm font-medium text-gray-700 mb-1">
              Billable
            </Label>
            <Switch
              id="isBillable"
              checked={formData.isBillable}
              onCheckedChange={(checked) => handleInputChange("isBillable", checked)}
            />
          </div>

          {formData.isBillable && (
            <div>
              <Label htmlFor="billableRate" className="block text-sm font-medium text-gray-700 mb-1">
                Billable Rate
              </Label>
              <Input
                id="billableRate"
                type="number"
                value={formData.billableRate}
                onChange={(e) => handleInputChange("billableRate", e.target.value)}
                className="w-full"
                placeholder="e.g., 50"
              />
            </div>
          )}

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Team Members</Label>
            <div className="flex flex-wrap gap-2">
              {formData.teamMembers.map((member) => (
                <div key={member} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1 text-sm">
                  <span>{member}</span>
                  <button
                    type="button"
                    onClick={() => handleTeamMemberRemove(member)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Add team member"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value) {
                  handleTeamMemberAdd(e.target.value)
                  e.target.value = ""
                }
              }}
              className="w-full mt-2"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6">
              Save Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
