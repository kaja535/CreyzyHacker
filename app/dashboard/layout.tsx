import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, rank, total_points, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background flex">
      {/* CRT Overlay effect */}
      <div className="crt-overlay opacity-30" />
      
      {/* Sidebar */}
      <DashboardSidebar 
        user={{
          email: user.email || '',
          username: profile?.username || 'Unknown',
          rank: profile?.rank || 'Rookie',
          points: profile?.total_points || 0,
          avatar_url: profile?.avatar_url,
        }}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
