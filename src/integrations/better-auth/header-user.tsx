import { LogOutIcon } from 'lucide-react'

import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type UserMenuUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'U'
  return source.charAt(0).toUpperCase()
}

export default function BetterAuthHeader({
  user,
}: {
  user?: UserMenuUser | null
}) {
  const { data: session, isPending } = authClient.useSession()
  const currentUser = user ?? session?.user

  if (isPending && !user) {
    return <Skeleton className="size-8 rounded-full" />
  }

  if (!currentUser) {
    return null
  }

  async function handleSignOut() {
    await authClient.signOut()
    window.location.assign('/signin')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'rounded-full',
        )}
        aria-label="Open account menu"
      >
        <Avatar size="sm">
          {currentUser.image ? (
            <AvatarImage src={currentUser.image} alt="" />
          ) : null}
          <AvatarFallback>
            {initials(currentUser.name, currentUser.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-foreground">
                {currentUser.name || 'Account'}
              </span>
              {currentUser.email ? (
                <span className="truncate text-xs font-normal">
                  {currentUser.email}
                </span>
              ) : null}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void handleSignOut()}
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
