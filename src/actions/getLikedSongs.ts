import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const getLikedSongs = async (): Promise<Song[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    // Use getUser to get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    // Handle user error or missing user
    if (userError) {
        console.log(userError.message);
        return [];
    }

    if (!user) {
        console.log('User not found');
        return [];
    }

    // Query liked songs by user_id
    const { data, error } = await supabase
        .from('liked_songs')
        .select('*, songs(*)')
        .eq('user_id', user.id) // Use user.id from authenticated user
        .order('created_at', { ascending: false });

    // Handle query errors
    if (error) {
        console.log(error.message);
        return [];
    }

    // If no data is returned, return an empty array
    if (!data) {
        return [];
    }

    // Map the liked songs data
    return data.map((item) => ({
        ...item.songs
    }));
};
