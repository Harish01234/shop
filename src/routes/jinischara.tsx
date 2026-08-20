import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getSession } from '#/lib/auth.functions'
import { AppHeader } from '@/components/app-header'

export const Route = createFileRoute('/jinischara')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/signin' })
    }
  },
  loader: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/signin' })
    }
    return { user: session.user }
  },
  component: JinisCharaLayout,
})

function JinisCharaLayout() {
  const { user } = Route.useLoaderData()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader user={user} />
      <Outlet />
    </div>
  )
}
