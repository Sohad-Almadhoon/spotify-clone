"use client";
import { Song } from "@/types";
import { useOnPlay } from "@/src/hooks/useOnPlay";
import SongItem from "@/src/components/SongItem";
import { useUser } from "@/src/hooks/useUser";

interface PageContentProps {
  songs: Song[];
}
const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs);
  const { isLoading, user, subscription } = useUser();
  

  if (songs.length === 0) {
    return <div className="mt-4 text-neutral-400">No songs available</div>;
  }
  return (
    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-8
        gap-4
        mt-4
        ">
      {songs.map((item) => (
        <SongItem
          key={item.id}
          onClick={(id: string) => onPlay(id)}
          data={item}
        />
      ))}
    </div>
  );
};

export default PageContent;
