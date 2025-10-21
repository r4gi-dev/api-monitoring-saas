'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const supabase = createClient()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [showEmail, setShowEmail] = useState(false) // メール表示/非表示の状態

  useEffect(() => {
    setIsMounted(true)

    // ユーザー情報を取得
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUsername(user.user_metadata.username || '')
        setEmail(user.email || '')
      }
    }
    fetchUser()
  }, [supabase])

  if (!isMounted) {
    return null
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your public profile and account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="email"
                type={showEmail ? 'text' : 'password'}
                value={email}
                readOnly
              />
              <Button variant="outline" size="icon" onClick={() => setShowEmail(!showEmail)}>
                {showEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="theme" className="flex flex-col space-y-1">
              <span>Theme</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Select the theme for the dashboard.
              </span>
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive important updates via email.
              </span>
            </Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
              <span>Browser Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Get notified directly in your browser.
              </span>
            </Label>
            <Switch id="push-notifications" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}