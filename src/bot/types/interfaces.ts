import { User } from "@grammyjs/types";
import { mongoose } from "@typegoose/typegoose";

export interface UserInterface extends User {
    lang: string;
    db_id: mongoose.Types.ObjectId;
}

export interface SessionBasketItemsInterface {
    count: number;
    price: number;
    total: number;
    product_name: string;
    product_id: mongoose.Types.ObjectId;
}

export interface SessionBasketInterface {
    total: number;
    items: SessionBasketItemsInterface[]
}