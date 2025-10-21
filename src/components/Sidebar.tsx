'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Home, BarChart2, Settings, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const topNavItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/errors", label: "Errors", icon: ShieldAlert },
]

const NavLink = ({ href, label, icon: Icon, isActive, onClick }: { href: string; label: string; icon: React.ElementType; isActive: boolean; onClick?: () => void }) => (
  <Link href={href} passHref>
    <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start" onClick={onClick}>
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  </Link>
)

export default function Sidebar() {
  const pathname = usePathname()
  const [isSheetOpen, setSheetOpen] = useState(false)

  const commonNav = (
    <nav className="grid gap-2 px-2">
      {topNavItems.map((item) => (
        <NavLink key={item.href} {...item} isActive={pathname === item.href} onClick={() => setSheetOpen(false)} />
      ))}
    </nav>
  )

  const settingsNavLink = (
    <NavLink
      href="/dashboard/settings"
      label="Settings"
      icon={Settings}
      isActive={pathname === "/dashboard/settings"}
      onClick={() => setSheetOpen(false)}
    />
  )
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:z-20 border-r bg-background">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="font-bold text-lg">
            API Monitor
          </Link>
          <Link href="/projects/new" passHref>
            <Button variant="outline" size="sm">
              + Add
            </Button>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col">
          {commonNav}
          <div className="mt-auto px-2">
            {settingsNavLink}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <header className="md:hidden sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
        <Link href="/" className="font-bold text-lg">
          API Monitor
        </Link>
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/" className="font-bold text-lg">
                API Monitor
              </Link>
            </div>
            <div className="py-4 flex flex-col h-full">
              <div className="px-4 mb-4">
                <Link href="/projects/new" passHref>
                  <Button variant="secondary" className="w-full" onClick={() => setSheetOpen(false)}>
                    + Add Project
                  </Button>
                </Link>
              </div>
              <div className="flex-1" onClick={() => setSheetOpen(false)}>{commonNav}</div>
              <div className="mt-auto px-2" onClick={() => setSheetOpen(false)}>
                {settingsNavLink}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}