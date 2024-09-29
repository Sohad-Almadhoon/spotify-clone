import { useAuthModal } from "@/src/hooks/useAuthModal";
import { useUser } from "@/src/hooks/useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

interface LikeButtonProps {
  songId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ songId }) => {
  console.log(songId);
  const router = useRouter();
  const { supabaseClient } = useSessionContext();
  const authModal = useAuthModal();
  const { user } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false); // Add a loading state

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchData = async () => {
      //* Find song in liked_songs table
      const { data, error } = await supabaseClient
        .from("liked_songs")
        .select("*")
        .eq("user_id", user.id)
        .eq("song_id", songId)
        .single();

      if (!error && data) {
        setIsLiked(true);
      }
    };

    fetchData();
  }, [songId, supabaseClient, user?.id]);

  const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

  const handleLike = async () => {
    if (!user) {
      return authModal.onOpen();
    }

    if (loading) return; // Prevent multiple requests
    setLoading(true); // Start loading

    if (isLiked) {
      // Unlike the song
      const { error } = await supabaseClient
        .from("liked_songs")
        .delete()
        .eq("user_id", user.id)
        .eq("song_id", songId);

      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(false);
        toast.success("Removed from liked songs.");
      }
    } else {
      // Like the song (only if not already liked)
      const { error } = await supabaseClient
        .from("liked_songs")
        .insert({ song_id: songId, user_id: user.id });

      if (error) {
        if (error.code === "23505") {
          // This is the error for duplicate key violations
          toast.error("You've already liked this song.");
        } else {
          toast.error(error.message);
        }
      } else {
        setIsLiked(true);
        toast.success("Liked!");
      }
    }

    setLoading(false); // Stop loading
    router.refresh();
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading} // Disable button while loading
      className="
        hover:opacity-75
        transition
        ">
      <Icon color={isLiked ? "#1DB954" : "white"} size={25} />
    </button>
  );
};

export default LikeButton;
