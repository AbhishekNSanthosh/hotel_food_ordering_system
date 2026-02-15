
export interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    subCategory?: string;
    image?: string;
    isAvailable: boolean;
    isVeg: boolean;
    spiceLevel?: 'Mild' | 'Medium' | 'Hot';
}
