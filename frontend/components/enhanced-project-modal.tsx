"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Plus, DollarSign, Users, FileText, Building, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface Project {
  id?: number
  name: string
  client: string
  description: string
  status?: string
  progress?: number
  billableRate?: number
  totalHours?: number
  billableHours?: number
  totalCost?: number
  members?: Array<{
    id: number
    name: string
    avatar?: string
    role?: string
  }>
  template: string
  createdDate?: string
  deadline: string
  isBillable: boolean
  recentActivity?: Array<{
    action: string
    user: string
    time: string
  }>
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: any) => void
  project?: Project | null
  existingTeamMembers?: string[] // Pass existing team members from parent
  onUpdateTeamMembers?: (members: string[]) => void // Callback to update team members list
}

const PROJECT_TEMPLATES = [
  {
    id: "web-development",
    name: "Web Development",
    description: "Full-stack web application development",
    defaultBillable: true,
    suggestedRate: 75,
  },
  {
    id: "mobile-app",
    name: "Mobile App Development",
    description: "iOS/Android mobile application development",
    defaultBillable: true,
    suggestedRate: 85,
  },
  {
    id: "ui-ux-design",
    name: "UI/UX Design",
    description: "User interface and experience design",
    defaultBillable: true,
    suggestedRate: 65,
  },
  {
    id: "consulting",
    name: "Consulting",
    description: "Strategic consulting and advisory services",
    defaultBillable: true,
    suggestedRate: 150,
  },
  {
    id: "marketing",
    name: "Marketing Campaign",
    description: "Digital marketing and campaign management",
    defaultBillable: true,
    suggestedRate: 55,
  },
  {
    id: "content-creation",
    name: "Content Creation",
    description: "Content writing, blogging, and copywriting",
    defaultBillable: true,
    suggestedRate: 45,
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description: "Data analysis and business intelligence",
    defaultBillable: true,
    suggestedRate: 95,
  },
  {
    id: "internal-project",
    name: "Internal Project",
    description: "Internal company project or initiative",
    defaultBillable: false,
    suggestedRate: 0,
  },
  {
    id: "research",
    name: "Research & Development",
    description: "Research and development activities",
    defaultBillable: false,
    suggestedRate: 0,
  },
  {
    id: "maintenance",
    name: "Maintenance & Support",
    description: "Ongoing maintenance and technical support",
    defaultBillable: true,
    suggestedRate: 65,
  },
]

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
  existingTeamMembers = [],
  onUpdateTeamMembers,
}: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    client: project?.client || "",
    description: project?.description || "",
    template: project?.template
      ? PROJECT_TEMPLATES.find((t) => t.name === project.template)?.id || ""
      : "",
    deadline: project?.deadline || "",
    isBillable: project?.isBillable ?? true,
    billableRate: project?.billableRate?.toString() || "",
    members: project?.members?.map((m) => m.name) || [],
    status: project?.status || "Planning",
    progress: project?.progress?.toString() || "0",
    totalHours: project?.totalHours?.toString() || "0",
  })

  const [newMemberName, setNewMemberName] = useState("")
  const [showCustomMember, setShowCustomMember] = useState(false)
  const [projectNameSuggestions, setProjectNameSuggestions] = useState<string[]>([])
  const [clientNameSuggestions, setClientNameSuggestions] = useState<string[]>([])
  const [memberNameSuggestions, setMemberNameSuggestions] = useState<string[]>([])

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: project?.name || "",
        client: project?.client || "",
        description: project?.description || "",
        template: project?.template
          ? PROJECT_TEMPLATES.find((t) => t.name === project.template)?.id || ""
          : "",
        deadline: project?.deadline || "",
        isBillable: project?.isBillable ?? true,
        billableRate: project?.billableRate?.toString() || "",
        members: project?.members?.map((m) => m.name) || [],
        status: project?.status || "Planning",
        progress: project?.progress?.toString() || "0",
        totalHours: project?.totalHours?.toString() || "0",
      })
      setNewMemberName("")
      setShowCustomMember(false)
    }
  }, [isOpen, project])

  // Extract unique project and client names from localStorage
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

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      // Get members from props
      let propMembers: string[] = existingTeamMembers || [];

      // Get members from localStorage
      const savedMembers = localStorage.getItem('members');
      let localMembers: string[] = [];
      if (savedMembers) {
        const members = JSON.parse(savedMembers);
        localMembers = members.map((m: any) => m.name).filter(Boolean);
      }

      // Merge and deduplicate
      setMemberNameSuggestions(Array.from(new Set([...propMembers, ...localMembers])));
    }
  }, [isOpen, existingTeamMembers]);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTemplateChange = (templateId: string) => {
    const template = PROJECT_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setFormData((prev) => ({
        ...prev,
        template: template.id,
        isBillable: template.defaultBillable,
        billableRate: template.suggestedRate.toString(),
        description: prev.description || template.description,
      }))
    }
  }

  const addTeamMember = (memberName: string) => {
    if (memberName && !formData.members.includes(memberName)) {
      const updatedMembers = [...formData.members, memberName]
      setFormData((prev) => ({
        ...prev,
        members: updatedMembers,
      }))

      // Update the global team members list
      const allMembers = Array.from(new Set([...existingTeamMembers, memberName]))
      onUpdateTeamMembers?.(allMembers)
    }
    setNewMemberName("")
    setShowCustomMember(false)
  }

  const removeTeamMember = (memberName: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((name) => name !== memberName),
    }))
  }

  const addCustomMember = () => {
    if (newMemberName.trim()) {
      addTeamMember(newMemberName.trim())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const projectData = {
      ...formData,
      billableRate: formData.isBillable ? Number.parseFloat(formData.billableRate) || 0 : 0,
      progress: Number.parseInt(formData.progress) || 0,
      totalHours: Number.parseFloat(formData.totalHours) || 0,
    }

    onSave(projectData)
    onClose()
  }

  // Available members are those that exist but aren't currently selected
  const availableMembers = existingTeamMembers.filter((member) => !formData.members.includes(member))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{project ? "Edit Project" : "Create New Project"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Project Template */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Project Template
              </Label>
              <Select value={formData.template} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder="Choose a project template"
                    >
                    {formData.template
                      ? PROJECT_TEMPLATES.find((t) => t.id === formData.template)?.name
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[60] max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg">
                  {PROJECT_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id} className="cursor-pointer hover:bg-gray-100 p-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{template.name}</span>
                        <span className="text-xs text-gray-500">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Name */}
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full"
                placeholder="Enter project name"
                required
                list="project-name-suggestions"
              />
              <datalist id="project-name-suggestions">
                {projectNameSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            {/* Client */}
            <div>
              <Label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-2" />
                Client *
              </Label>
              <Input
                id="client"
                type="text"
                value={formData.client}
                onChange={(e) => handleInputChange("client", e.target.value)}
                className="w-full"
                placeholder="Enter client name"
                required
                list="client-name-suggestions"
              />
              <datalist id="client-name-suggestions">
                {clientNameSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full min-h-[100px]"
                placeholder="Describe the project goals and requirements"
              />
            </div>

            {/* Billing Settings */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Billing Settings
              </h3>

              {/* Billable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Billable Project</Label>
                  <p className="text-xs text-gray-500">Enable billing and hourly rates for this project</p>
                </div>
                <Switch
                  checked={formData.isBillable}
                  onCheckedChange={(checked) => handleInputChange("isBillable", checked)}
                />
              </div>

              {/* Billable Rate */}
              {formData.isBillable && (
                <div>
                  <Label htmlFor="billableRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate (USD)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="billableRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.billableRate}
                      onChange={(e) => handleInputChange("billableRate", e.target.value)}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Team Members */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Members
              </h3>

              {/* Selected Members */}
              {formData.members.length > 0 && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Members ({formData.members.length})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.members.map((member, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1 px-3 py-1">
                        <User className="h-3 w-3" />
                        <span>{member}</span>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(member)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Team Members */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Add Team Members</Label>

                {/* Previously Added Members */}
                {availableMembers.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Select from previously added members:</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableMembers.map((member) => (
                        <Button
                          key={member}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTeamMember(member)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {member}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Member */}
                <div className="space-y-2">
                  {!showCustomMember ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomMember(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Team Member
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Enter member name"
                        className="flex-1"
                        onKeyPress={(e) => e.key === "Enter" && addCustomMember()}
                        list="member-name-suggestions"
                      />
                      <datalist id="member-name-suggestions">
                        {memberNameSuggestions.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                      <Button type="button" onClick={addCustomMember} disabled={!newMemberName.trim()} size="sm">
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCustomMember(false)
                          setNewMemberName("")
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Empty State */}
                {existingTeamMembers.length === 0 && !showCustomMember && (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">No team members added yet</p>
                    <p className="text-xs text-gray-400">
                      Add team members to this project and they'll be available for future projects
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deadline */}
              <div>
                <Label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
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

              {/* Initial Hours (for editing) */}
              {project && (
                <div>
                  <Label htmlFor="totalHours" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Hours Logged
                  </Label>
                  <Input
                    id="totalHours"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.totalHours}
                    onChange={(e) => handleInputChange("totalHours", e.target.value)}
                    className="w-full"
                    placeholder="0.0"
                  />
                </div>
              )}
            </div>

            {/* Status and Progress (for editing) */}
            {project && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60] bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="Planning" className="cursor-pointer hover:bg-gray-100 p-2">
                        <span className="text-gray-900">Planning</span>
                      </SelectItem>
                      <SelectItem value="In Progress" className="cursor-pointer hover:bg-gray-100 p-2">
                        <span className="text-gray-900">In Progress</span>
                      </SelectItem>
                      <SelectItem value="Review" className="cursor-pointer hover:bg-gray-100 p-2">
                        <span className="text-gray-900">Review</span>
                      </SelectItem>
                      <SelectItem value="On Hold" className="cursor-pointer hover:bg-gray-100 p-2">
                        <span className="text-gray-900">On Hold</span>
                      </SelectItem>
                      <SelectItem value="Completed" className="cursor-pointer hover:bg-gray-100 p-2">
                        <span className="text-gray-900">Completed</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-2">
                    Progress (%)
                  </Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleInputChange("progress", e.target.value)}
                    className="w-full"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose} className="text-gray-600 hover:text-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              {project ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
