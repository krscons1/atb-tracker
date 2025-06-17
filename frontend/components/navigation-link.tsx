"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NavigationLinkProps {
  href: string
  children: React.ReactNode
  variant?: "default" | "outline"
  className?: string
}

export function NavigationLink({ href, children, variant = "default", className = "" }: NavigationLinkProps) {
  return (
    <Link href={href}>
      <Button variant={variant} className={className}>
        {children}
      </Button>
    </Link>
  )
}
