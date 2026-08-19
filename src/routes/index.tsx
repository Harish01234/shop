import { createFileRoute, redirect } from '@tanstack/react-router'

import { getSession } from '#/lib/auth.functions'
import { AppHeader } from '@/components/app-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/signin' })
    }
    return { session }
  },
  component: Home,
})

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'U'
  return source.charAt(0).toUpperCase()
}

function Home() {
  const { session } = Route.useRouteContext()
  const user = session.user
  const name = user.name || user.email || 'there'
  const role = 'role' in user && typeof user.role === 'string' ? user.role : 'user'

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader user={user} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
        <Card className="max-w-lg shadow-lg ring-foreground/15">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Avatar size="lg">
                {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">Welcome, {name}</CardTitle>
                  <Badge>{role}</Badge>
                </div>
                {user.email ? (
                  <CardDescription className="mt-1 truncate">
                    {user.email}
                  </CardDescription>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are signed in. This is the home page.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
