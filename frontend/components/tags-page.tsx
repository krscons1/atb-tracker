"use client"

import { useState, useEffect } from "react"
import { Search, MoreVertical, Plus, TagIcon, Clock, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { TeamTagModal } from "./team-tag-modal"
import type { Tag } from "./team-page"

export function TagsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  // Load tags from global state (set in TeamPage)
  useEffect(() => {
    if (typeof window !== "undefined" && window.teamTags) {
      setTags(window.teamTags)
    }
  }, [])

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddTag = () => {
    setEditingTag(null)
    setIsAddTagModalOpen(true)
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setIsAddTagModalOpen(true)
  }

  const handleDeleteTag = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id))
    // Update global tags
    if (typeof window !== "undefined") {
      window.teamTags = tags.filter((tag) => tag.id !== id)
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

  return (
    <>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Tags</h1>
          <Button onClick={handleAddTag} className="bg-green-500 hover:bg-green-600 text-white px-6">
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Tags Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length}</div>
                <p className="text-xs text-muted-foreground">Use tags to categorize your time entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Used Tag</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length > 0 ? tags[0].name : "No tags yet"}</div>
                <p className="text-xs text-muted-foreground">
                  {tags.length > 0 ? "Based on time entries" : "Add tags to track usage"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tag Usage</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 entries</div>
                <p className="text-xs text-muted-foreground">Apply tags to time entries to see usage</p>
              </CardContent>
            </Card>
          </div>

          {/* Tags List */}
          <Card>
            <CardHeader>
              <CardTitle>All Tags</CardTitle>
              <CardDescription>Manage and organize your time tracking tags</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTags.length === 0 ? (
                <div className="text-center py-10">
                  <div className="flex justify-center mb-4">
                    <TagIcon className="h-16 w-16 text-gray-300" />
                  </div>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? "No tags match your search" : "No tags have been created yet"}
                  </p>
                  <Button onClick={handleAddTag} className="bg-green-500 hover:bg-green-600 text-white px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Tag
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTags.map((tag) => (
                    <div key={tag.id} className="border rounded-lg p-4 flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 rounded-full ${tag.color} mt-1`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{tag.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {tag.description || "No description"}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              0 entries
                            </Badge>
                          </div>
                        </div>
                      </div>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
