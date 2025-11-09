import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { ApproveProductDto } from './dto/approve-product.dto';
import { RejectProductDto } from './dto/reject-product.dto';
import { AppealProductDto } from './dto/appeal-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(query: FindProductsQueryDto): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    approve(id: string, dto: ApproveProductDto, req: any): Promise<import("./entities/product.entity").Product>;
    reject(id: string, dto: RejectProductDto, req: any): Promise<import("./entities/product.entity").Product>;
    appeal(id: string, dto: AppealProductDto, req: any): Promise<import("./entities/product.entity").Product>;
    getModerationEvents(id: string, req: any): Promise<import("./entities/product-moderation-event.entity").ProductModerationEvent[]>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<void>;
    getRevisions(id: string, req: any): Promise<import("./entities/product-revision.entity").ProductRevision[]>;
    restoreRevision(id: string, revisionId: string, req: any): Promise<import("./entities/product.entity").Product>;
}
