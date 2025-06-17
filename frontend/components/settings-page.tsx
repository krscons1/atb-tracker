"use client"

import { useState, useEffect } from "react"
import {
  User,
  Bell,
  Shield,
  Palette,
  Clock,
  DollarSign,
  Download,
  Trash2,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Key,
  Users,
  Zap,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Wifi,
  Database,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SettingsPage() {
  // Profile Settings
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    company: "",
    bio: "",
    location: "",
    website: "",
    timezone: "",
    avatar: "",
  })
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      try {
        const res = await fetch("/api/user-settings/profile/", {
          credentials: "include"
        })
        if (!res.ok) throw new Error("Failed to fetch profile")
        const data = await res.json()
        setProfileData(data)
      } catch (err) {
        setError("Could not load profile.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    setError("")
    try {
      const res = await fetch("/api/user-settings/profile/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileData)
      })
      if (!res.ok) throw new Error("Failed to save profile")
      setSuccess(true)
    } catch (err) {
      setError("Could not save profile.")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = () => {
    // Simulate file upload
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfileData((prev) => ({ ...prev, avatar: e.target?.result as string }))
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and application settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="text-gray-600">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            {success && <span className="text-green-600 ml-4">Profile saved!</span>}
            {error && <span className="text-red-600 ml-4">{error}</span>}
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Tabs value="profile" className="space-y-6">
            <TabsContent value="profile">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>Update your personal information and profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt="Profile" />
                        <AvatarFallback className="text-lg">
                          {profileData.first_name?.[0]}
                          {profileData.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={handleAvatarUpload}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {profileData.first_name} {profileData.last_name}
                      </h3>
                      <p className="text-gray-600">{profileData.job_title}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={handleAvatarUpload}>
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) => handleProfileUpdate("first_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) => handleProfileUpdate("last_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileUpdate("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={profileData.job_title}
                        onChange={(e) => handleProfileUpdate("job_title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => handleProfileUpdate("company", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleProfileUpdate("location", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => handleProfileUpdate("website", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio">About Yourself</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Tell us about yourself, your experience, and interests..."
                    />
                  </div>

                  {/* Timezone */}
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={profileData.timezone}
                      onValueChange={(value) => handleProfileUpdate("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
