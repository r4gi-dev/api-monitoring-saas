'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function NewProjectPage() {
  const supabase = createClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create a project.')
      setIsLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('projects')
      .insert([{ name, description, user_id: user.id }])

    if (insertError) {
      setError(insertError.message)
    } else {
      // Successfully created, navigate to dashboard or the new project page
      router.push('/dashboard')
      router.refresh() // Refresh server components to show the new project
    }

    setIsLoading(false)
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create a new project</CardTitle>
            <CardDescription>Give your new project a name and an optional description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Awesome API"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="A short description of your project."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </CardFooter>
        </form>
        {error && <p className="text-sm text-red-600 p-4 pt-0">{error}</p>}
      </Card>
    </div>
  )
}