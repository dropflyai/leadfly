import { LocalStorage } from '../../../../local-storage-system.js'

export async function POST(request) {
  try {
    const userData = await request.json()
    
    // Add user to local storage system
    const users = LocalStorage.getUsers()
    const existingUser = users.find(user => user.email === userData.email)
    
    if (!existingUser) {
      // Create new user
      const newUser = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company,
        provider: userData.provider,
        picture: userData.picture,
        created_at: userData.created_at
      }
      
      users.push(newUser)
      LocalStorage.updateUsers(users)
      
      // Create default subscription for Google users
      const subscriptions = LocalStorage.getSubscriptions()
      subscriptions.push({
        id: `sub_${Date.now()}`,
        user_id: userData.id,
        tier: userData.tier || 'growth',
        status: 'active',
        monthly_leads: userData.tier === 'enterprise' ? 1000 : 100,
        leads_used_this_period: 0,
        created_at: new Date().toISOString()
      })
      LocalStorage.updateSubscriptions(subscriptions)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google authentication successful',
        user: userData
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Google auth error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Authentication failed' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}