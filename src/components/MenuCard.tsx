import { MenuItem } from "@/types";
import { Plus } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onViewDetail: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAdd, onViewDetail }: MenuCardProps) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all hover:border-foreground/20 cursor-pointer"
      onClick={() => onViewDetail(item)}
    >
      <div className="aspect-[16/10] relative w-full overflow-hidden bg-muted group-hover:opacity-90 transition-opacity">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                item.name
              )}&background=random&color=fff&size=512&bold=true`;
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-secondary/40 to-muted/60 text-muted-foreground">
            <span className="text-3xl mb-1">🍽️</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              No Image
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-sm backdrop-blur-md ${item.isVeg
                ? "bg-green-500/10 border-green-500/20 text-green-600"
                : "bg-red-500/10 border-red-500/20 text-red-600"
              }`}
          >
            {item.isVeg ? "🥬 Veg" : "🍗 Non-Veg"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-medium text-base text-foreground line-clamp-1">
            {item.name}
          </h3>
          <span className="font-semibold text-sm text-foreground">
            ₹{item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-1">
            {item.spiceLevel && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
                {item.spiceLevel}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(item);
            }}
            className="h-8 px-3 flex items-center gap-1.5 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
