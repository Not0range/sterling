export interface Category {
    id: number;
    title: string;
}

export interface Product {
    id: number;
    title: string;
    imageUrl: string;
    price: number;
    cart: number;
}

export interface ProductDetail {
    id: number;
    title: string;
    categoryId: number;
    category: string;
    description: string;
    favorite: boolean;
    types: ProductType[];
}

export interface ProductType {
    id: number;
    title: string;
    price: number;
    image: boolean;
    cart: number;
}