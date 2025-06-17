"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/components/auth/auth-context";

interface User {
  id: string
  email: string
  name: string
  picture?: string
  provider: "email" | "google"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication on mount
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user")
        const storedAuth = localStorage.getItem("isAuthenticated")

        if (storedUser && storedAuth === "true") {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        // Clear invalid data
        localStorage.removeItem("user")
        localStorage.removeItem("isAuthenticated")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("isAuthenticated", "true")
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
    window.location.href = "/"
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
