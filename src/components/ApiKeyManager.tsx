'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react'

interface ApiKeyManagerProps {
  projectId: string;
  initialApiKey: string | null;
}

export default function ApiKeyManager({ projectId, initialApiKey }: ApiKeyManagerProps) {
  const supabase = createClient()
  const [apiKey, setApiKey] = useState(initialApiKey)
  const [isLoading, setIsLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const generateNewKey = () => {
    // A simple way to generate a random key-like string
    return `sk_${crypto.randomUUID().replace(/-/g, '')}`
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    const newKey = generateNewKey()
    const { data, error } = await supabase
      .from('projects')
      .update({ api_key: newKey })
      .eq('id', projectId)
      .select('api_key')
      .single()

    if (error) {
      alert('Error generating API key: ' + error.message)
    } else if (data) {
      setApiKey(data.api_key)
    }
    setIsLoading(false)
  }

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      alert('API Key copied to clipboard!')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key</CardTitle>
        <CardDescription>
          Use this key in your application to send logs to this project.
          Keep it secret and secure!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {apiKey ? (
          <div className="flex items-center space-x-2">
            <Input
              type={showKey ? 'text' : 'password'}
              readOnly
              value={apiKey}
              className="font-mono"
            />
            <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No API key generated yet.</p>
        )}
      </CardContent>
      <div className="flex justify-end p-6 pt-0">
        <Button onClick={handleGenerate} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : (apiKey ? 'Regenerate Key' : 'Generate Key')}
        </Button>
      </div>
    </Card>
  )
}
