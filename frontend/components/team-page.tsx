"use client"

import { useState, useEffect } from "react"
import { Search, MoreVertical, ChevronDown, Info, UserPlus, Download, Check, Plus, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { TeamMemberModal } from "./team-member-modal"
import { TeamGroupModal } from "./team-group-modal"
import { ReminderModal, type Reminder } from "./reminder-modal"
import { ReminderCard } from "./reminder-card"
import { TeamTagModal } from "./team-tag-modal"

import { TeamMember, TeamGroup } from "../types";

export interface Tag {
  id: string
  name: string
  color: string
  description?: string
}

export function TeamPage() {
  const [activeTab, setActiveTab] = useState("members")
  const [searchTerm, setSearchTerm] = useState("")
  const [showActive, setShowActive] = useState("active")
  const [newGroupName, setNewGroupName] = useState("")
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false)
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false)
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editingGroup, setEditingGroup] = useState<TeamGroup | null>(null)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Helper to adapt backend response to TeamMember type
  const adaptMember = (m: any): TeamMember => ({
    id: String(m.id),
    name: m.name,
    email: m.email || "",
    avatar: m.avatar || m.name?.split(" ").map((n: string) => n[0]).join("") || "",
    rate: m.rate ? String(m.rate) : "-",
    cost: m.cost ? String(m.cost) : "-",
    workHours: m.work_hours || m.workHours || "-",
    accessRights: m.access_rights || m.accessRights || "Standard",
    groups: typeof m.groups === "string" ? m.groups.split(",") : Array.isArray(m.groups) ? m.groups : [],
  })

  // Fetch members from backend on mount
  useEffect(() => {
    setLoadingMembers(true)
    fetch("/api/users/members/")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMembers(data.map(adaptMember))
        } else if (Array.isArray(data.results)) {
          setMembers(data.results.map(adaptMember))
        }
      })
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false))
  }, [])

  const [groups, setGroups] = useState<TeamGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('groups')
      if (saved) return JSON.parse(saved)
    }
    return []
  })

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Submit Weekly Timesheet",
      description: "Please submit your timesheet for the previous week",
      frequency: "weekly",
      dayOfWeek: "5", // Friday
      time: "16:00",
      teamMembers: ["1", "2", "3"],
      notifyBy: ["email", "notification"],
    },
  ])

  // Add tags state
  const [tags, setTags] = useState<Tag[]>([
    {
      id: "1",
      name: "Development",
      color: "bg-blue-500",
      description: "Software development tasks",
    },
    {
      id: "2",
      name: "Design",
      color: "bg-purple-500",
      description: "UI/UX design work",
    },
    {
      id: "3",
      name: "Meeting",
      color: "bg-green-500",
      description: "Team meetings and client calls",
    },
  ])

  // Make tags available globally
  if (typeof window !== "undefined") {
    window.teamTags = tags
  }

  const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        access: "Standard",
        members: [],
      }
      setGroups([...groups, newGroup])
      setNewGroupName("")
    } else {
      setEditingGroup(null)
      setIsAddGroupModalOpen(true)
    }
  }

  const handleAddMember = () => {
    setEditingMember(null)
    setIsAddMemberModalOpen(true)
  }

  const handleAddReminder = () => {
    setEditingReminder(null)
    setIsAddReminderModalOpen(true)
  }

  const handleAddTag = () => {
    setEditingTag(null)
    setIsAddTagModalOpen(true)
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setIsAddMemberModalOpen(true)
  }

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setIsAddReminderModalOpen(true)
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setIsAddTagModalOpen(true)
  }

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
  }

  const handleDeleteTag = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id))
    // Update global tags
    if (typeof window !== "undefined") {
      window.teamTags = tags.filter((tag) => tag.id !== id)
    }
  }

  const fetchMembers = async () => {
    setLoadingMembers(true)
    try {
      const res = await fetch("/api/users/members/")
      const data = await res.json()
      if (Array.isArray(data)) setMembers(data.map(adaptMember))
      else if (Array.isArray(data.results)) setMembers(data.results.map(adaptMember))
      else setMembers([])
    } catch {
      setMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSaveMember = async (memberData: TeamMember) => {
    // Always ensure id is present
    const memberWithId: TeamMember = {
      ...memberData,
      id: memberData.id || Date.now().toString(),
    };
    if (memberWithId.id) {
      // Edit existing member (optional: implement PUT/PATCH to backend)
      setMembers((prev) => prev.map((member) => (member.id === memberWithId.id ? memberWithId : member)))
    } else {
      // Add new member to backend
      try {
        const response = await fetch("/api/users/members/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: memberWithId.name,
            email: memberWithId.email,
            rate: memberWithId.rate,
            cost: memberWithId.cost,
            work_hours: memberWithId.workHours,
            access_rights: memberWithId.accessRights,
            groups: Array.isArray(memberWithId.groups) ? memberWithId.groups.join(",") : memberWithId.groups,
          })
        })
        const result = await response.json()
        if (response.ok && result.member) {
          setNotification(result.notification || "Member added successfully!")
          await fetchMembers() // Re-fetch from backend to ensure sync
        } else {
          setNotification(result.notification || "Failed to add member.")
        }
      } catch (err) {
        setNotification("Failed to add member.")
      }
    }
  }

  const handleSaveGroup = (groupData: TeamGroup) => {
    if (groupData.id) {
      // Edit existing group
      setGroups((prev) => prev.map((group) => (group.id === groupData.id ? groupData : group)))
    } else {
      // Add new group
      const newGroup: TeamGroup = {
        ...groupData,
        id: Date.now().toString(),
        access: groupData.access || "Standard",
        members: groupData.members || [],
      }
      setGroups((prev) => [...prev, newGroup])
    }
  }

  const handleSaveReminder = (reminderData: Reminder) => {
    if (reminderData.id) {
      // Edit existing reminder
      setReminders((prev) => prev.map((reminder) => (reminder.id === reminderData.id ? reminderData : reminder)))
    } else {
      // Add new reminder
      const newReminder = {
        ...reminderData,
        id: Date.now().toString(),
      }
      setReminders((prev) => [...prev, newReminder])
    }
  }

  const handleSaveTag = (tagData: Tag) => {
    if (tagData.id) {
      // Edit existing tag
      setTags((prev) => prev.map((tag) => (tag.id === tagData.id ? tagData : tag)))
    } else {
      // Add new tag
      const newTag = {
        ...tagData,
        id: Date.now().toString(),
      }
      setTags((prev) => [...prev, newTag])
    }

    // Update global tags
    if (typeof window !== "undefined") {
      window.teamTags = tagData.id
        ? tags.map((tag) => (tag.id === tagData.id ? tagData : tag))
        : [...tags, { ...tagData, id: Date.now().toString() }]
    }
  }

  // Remove localStorage for members (use only backend)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('groups', JSON.stringify(groups))
    }
  }, [groups])

  return (
    <>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Team</h1>
          {activeTab === "members" && (
            <Button onClick={handleAddMember} className="bg-blue-500 hover:bg-blue-600 text-white px-6">
              <UserPlus className="h-4 w-4 mr-2" />
              Add new member
            </Button>
          )}
          {activeTab === "reminders" && (
            <Button onClick={handleAddReminder} className="bg-purple-500 hover:bg-purple-600 text-white px-6">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          )}
          {activeTab === "tags" && (
            <Button onClick={handleAddTag} className="bg-green-500 hover:bg-green-600 text-white px-6">
              <TagIcon className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 p-0 h-auto">
            <TabsTrigger
              value="members"
              className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
            >
              MEMBERS
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
            >
              GROUPS
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
            >
              REMINDERS
            </TabsTrigger>
            <TabsTrigger
              value="tags"
              className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none"
            >
              TAGS
            </TabsTrigger>
          </TabsList>

          {/* Members Tab Content */}
          <TabsContent value="members" className="mt-0 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Select value={showActive} onValueChange={setShowActive}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Show Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Show Active</SelectItem>
                    <SelectItem value="all">Show All</SelectItem>
                    <SelectItem value="inactive">Show Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <div></div>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50/80">
                <div className="col-span-3 flex items-center">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                    NAME <ChevronDown className="h-3 w-3 ml-1" />
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">RATE</span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COST</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">WORK HOURS</span>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                    ACCESS RIGHTS <Info className="h-3 w-3 ml-1 text-gray-400" />
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">GROUPS</span>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="flex justify-center mb-6">
                      <img
                        src="/placeholder.svg?height=120&width=180"
                        alt="Team illustration"
                        className="h-30 w-auto"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Invite more members to this Organization
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Use this page to invite more users to your workspace and later manage their access rights.
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite members
                      </Button>
                      <Button variant="outline" className="flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Book a demo
                      </Button>
                    </div>
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="col-span-3 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {member.avatar || member.name.substring(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{member.name}</span>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm text-gray-600">{member.rate}</span>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm text-gray-600">{member.cost}</span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-gray-600">{member.workHours}</span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                          {member.accessRights}
                        </Badge>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm text-gray-600">
                          {member.groups.length > 0 ? member.groups.join(", ") : "-"}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMember(member)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Groups Tab Content */}
          <TabsContent value="groups" className="mt-0 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by username or group name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add new group"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-64"
                />
                <Button onClick={handleAddGroup} className="bg-blue-500 hover:bg-blue-600 text-white">
                  ADD
                </Button>
              </div>
            </div>

            {/* Groups Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50/80">
                <span className="text-sm font-medium text-gray-600">Groups</span>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/50">
                <div className="col-span-6">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">NAME</span>
                </div>
                <div className="col-span-6">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">ACCESS</span>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredGroups.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">No groups found</p>
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="col-span-6">
                        <span className="text-sm font-medium text-gray-900">{group.name}</span>
                      </div>
                      <div className="col-span-5">
                        <span className="text-sm text-gray-600">{group.access}</span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingGroup(group)
                                setIsAddGroupModalOpen(true)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Reminders Tab Content */}
          <TabsContent value="reminders" className="mt-0 pt-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Reminders</h3>
              <p className="text-gray-600 mb-6">
                Set up reminders for your team members to track their time or submit reports.
              </p>

              {reminders.length === 0 ? (
                <div className="text-center py-10">
                  <div className="flex justify-center mb-4">
                    <img src="/placeholder.svg?height=100&width=100" alt="No reminders" className="h-24 w-auto" />
                  </div>
                  <p className="text-gray-500 mb-6">No reminders have been set up yet.</p>
                  <Button onClick={handleAddReminder} className="bg-purple-500 hover:bg-purple-600 text-white px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reminder
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {reminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={handleEditReminder}
                      onDelete={handleDeleteReminder}
                      teamMembers={members}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tags Tab Content */}
          <TabsContent value="tags" className="mt-0 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tags Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50/80">
                <span className="text-sm font-medium text-gray-600">Team Tags</span>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/50">
                <div className="col-span-3">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">TAG</span>
                </div>
                <div className="col-span-8">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">DESCRIPTION</span>
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredTags.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="flex justify-center mb-4">
                      <TagIcon className="h-16 w-16 text-gray-300" />
                    </div>
                    <p className="text-gray-500 mb-6">No tags found</p>
                    <Button onClick={handleAddTag} className="bg-green-500 hover:bg-green-600 text-white px-6">
                      <TagIcon className="h-4 w-4 mr-2" />
                      Create First Tag
                    </Button>
                  </div>
                ) : (
                  filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="col-span-3 flex items-center">
                        <div className={`w-3 h-3 rounded-full ${tag.color} mr-2`}></div>
                        <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      </div>
                      <div className="col-span-8">
                        <span className="text-sm text-gray-600">{tag.description || "No description"}</span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTag(tag)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTag(tag.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Team Member Modal */}
      <TeamMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSave={handleSaveMember}
        member={editingMember}
      />

      {/* Team Group Modal */}
      <TeamGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onSave={handleSaveGroup}
        group={editingGroup}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isAddReminderModalOpen}
        onClose={() => setIsAddReminderModalOpen(false)}
        onSave={handleSaveReminder}
        reminder={editingReminder}
        teamMembers={members}
      />

      {/* Tag Modal */}
      <TeamTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        onSave={handleSaveTag}
        tag={editingTag}
      />
    </>
  )
}
