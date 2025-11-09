import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { AddProductDto } from './dto/add-product.dto';
export declare class CollectionsController {
    private readonly collectionsService;
    constructor(collectionsService: CollectionsService);
    create(req: any, createDto: CreateCollectionDto): Promise<import("./entities/collection.entity").Collection>;
    findByUser(req: any): Promise<import("./entities/collection.entity").Collection[]>;
    findOne(req: any, id: string): Promise<{
        collection: import("./entities/collection.entity").Collection;
        products: import("../products/entities/product.entity").Product[];
    }>;
    addProduct(req: any, id: string, addProductDto: AddProductDto): Promise<void>;
    removeProduct(req: any, id: string, productId: string): Promise<void>;
}
