
import { MenuItem } from '@/types';

interface MenuCardProps {
    item: MenuItem;
    onAdd: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAdd }: MenuCardProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] relative w-full overflow-hidden bg-muted">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                        No Image
                    </div>
                )}
                {(
                    <div className="absolute top-2 right-2 rounded-full bg-background/90 px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
                        {item.isVeg ? (
                            <span className="text-green-600 dark:text-green-500">Veg</span>
                        ) : (
                            <span className="text-red-600 dark:text-red-500">Non-Veg</span>
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col space-y-3 p-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg line-clamp-1 tracking-tight">{item.name}</h3>
                    <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground border border-border px-2 py-1 rounded">
                        {item.spiceLevel}
                    </span>
                    <button
                        onClick={() => onAdd(item)}
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Add to Order
                    </button>
                </div>
            </div>
        </div>
    );
}
