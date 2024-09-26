"use client"
import LikeButton from "@/src/components/LikeButton";
import MediaItem from "@/src/components/MediaItem";
import { Song } from "@/types";


interface SearchContentProps {
  songs: Song[];
}

const SearchContent: React.FC<SearchContentProps> = ({ songs }) => {
  if (songs.length === 0) {
    return (
      <div
        className="
            flex
            flex-col
            gap-y-2
            w-full
            px-6
            text-neutral-400
            ">
        No songs found.
      </div>
    );
  }
  console.log(songs)
  return (
    <div className="flex flex-col gap-y-2 w-full px-6">
      {songs.map((song) => (
        <div key={song.id} className="flex items-center gap-x-4 w-full">
          <div className="flex-1">
            <MediaItem onClick={()=>{}} data={song} />
          </div>
          <LikeButton songId={song.id} />
        </div>
      ))}
    </div>
  );
};

export default SearchContent;
