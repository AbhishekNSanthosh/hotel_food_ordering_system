
import { MenuItem } from '@/types';

interface MenuCardProps {
    item: MenuItem;
    onAdd: (item: MenuItem) => void;
    onViewDetail: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAdd, onViewDetail }: MenuCardProps) {
    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-card-foreground shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => onViewDetail(item)}
        >
            <div className="aspect-[4/3] relative w-full overflow-hidden bg-muted">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50 text-muted-foreground font-medium">
                        No Image
                    </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                    <div className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md">
                        {item.isVeg ? (
                            <span className="text-green-600">🥬 Veg</span>
                        ) : (
                            <span className="text-red-600">🍗 Non-Veg</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-1 flex-col space-y-3 p-5">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 flex-1">{item.name}</h3>
                    <span className="text-xl font-black text-[var(--deep-burgundy)]">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">{item.description}</p>

                <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        {item.spiceLevel && (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                {'🌶️'.repeat(item.spiceLevel === 'Mild' ? 1 : item.spiceLevel === 'Medium' ? 2 : 3)} {item.spiceLevel}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd(item);
                        }}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-[var(--deep-burgundy)] to-[var(--muted-gold)] text-white text-xs font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        ADD QUICKLY
                    </button>
                </div>
            </div>
        </div>
    );
}
