export class PrizeModel {
    id?: number;
    name?: string;
    imageUrl?: string;
}

export class PrizeStorageModel {
    prize?: PrizeModel;
    quantityAvailable?: number;
}
