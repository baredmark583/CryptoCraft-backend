import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
export declare class CollectionsService {
    private readonly collectionRepository;
    private readonly userRepository;
    private readonly productRepository;
    constructor(collectionRepository: Repository<Collection>, userRepository: Repository<User>, productRepository: Repository<Product>);
    create(userId: string, createDto: CreateCollectionDto): Promise<Collection>;
    findByUserId(userId: string): Promise<Collection[]>;
    findOne(collectionId: string, userId: string): Promise<{
        collection: Collection;
        products: Product[];
    }>;
    addProduct(collectionId: string, productId: string, userId: string): Promise<void>;
    removeProduct(collectionId: string, productId: string, userId: string): Promise<void>;
}
