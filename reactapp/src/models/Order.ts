export interface Order {
    id: number;
    userId: number;
    status: number;
    totalPrice: number;
    items: OrderSubItem[];
}

export interface OrderSubItem {
    id: number;
    groupTitle: string;
    title: string;
    price: number;
    count: number;
}

export interface CartProduct {
    id: number;
    groupId: number;
    groupTitle: string;
    title: string;
    price: number;
    count: number;
}