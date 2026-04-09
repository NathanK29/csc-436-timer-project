import { supabase } from './supabase.js'

export async function getMyProfile(userId) {
    const { data } = await supabase
        .from('Users')
        .select('*')             
        .eq('user_id', userId)   
        .maybeSingle()           
    return data
}

export async function searchByUsername(query) {
    const { data } = await supabase
        .from('Users')
        .select('username, email')        
        .ilike('username', `%${query}%`)  
        .limit(10)                        
    return data || []                     
}

export async function addFriend(myUserId, theirUsername) {

    const { data } = await supabase
        .from('Users')
        .select('friends')
        .eq('user_id', myUserId)
        .single()                  

    // avoid duplicates
    if (data.friends && data.friends.includes(theirUsername)) return null

    const currentFriends = data.friends || []
	const updated = currentFriends.concat(theirUsername)

    const { error } = await supabase
        .from('Users')
        .update({ friends: updated })
        .eq('user_id', myUserId)
    return error
}

export async function removeFriend(myUserId, theirUsername) {
    const { data } = await supabase
        .from('Users')
        .select('friends')
        .eq('user_id', myUserId)
        .single()

    const updated = (data.friends || []).filter(f => f !== theirUsername)

    const { error } = await supabase
        .from('Users')
        .update({ friends: updated })
        .eq('user_id', myUserId)
    return error
}
