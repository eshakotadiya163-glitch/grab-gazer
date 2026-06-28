import { Heart } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-blush-deep text-center py-2.5 px-4 text-sm font-medium text-foreground">
      <span className="inline-flex items-center gap-2">
        Buy for Rs 2000+ & get a free surprise gift! <Heart className="inline h-3.5 w-3.5 fill-current" />
      </span>
    </div>
  );
}
