import { supabase } from './supabase'

// Update tipe data sesuai database kamu
export type UserRole = 'PEMILIK' | 'PENCARI' | 'admin' | 'user' | null

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      // console.error('Error fetching user role:', error) 
      // Error is common if profile doesn't exist yet
      return null
    }

    return (data?.role as UserRole) || null
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

export async function getCurrentUserRole(): Promise<UserRole> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !sessionData.session?.user.id) {
      return null
    }

    return getUserRole(sessionData.session.user.id)
  } catch (error) {
    console.error('Error in getCurrentUserRole:', error)
    return null
  }
}