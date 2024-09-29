import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const getSongsByUserId = async (): Promise<Song[]> => {
    const supabase = createServerComponentClient({
        cookies
    });

    // Use supabase.auth.getUser() to securely authenticate the user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.log(userError.message);
        return [];
    }

    if (!userData || !userData.user) {
        console.log('No authenticated user found');
        return [];
    }

    // Fetch songs by user_id using the authenticated user's ID
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.log(error.message);
        return [];
    }

    // Return the songs data or an empty array if no data
    return (data as Song[] || []);
};
