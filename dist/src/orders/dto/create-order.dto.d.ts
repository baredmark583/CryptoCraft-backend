import { ShippingAddress } from '../../users/entities/user.entity';
declare class CartItemDto {
    product: {
        id: string;
        seller: {
            id: string;
        };
    };
    quantity: number;
    priceAtTimeOfAddition: number;
    variant?: any;
    purchaseType: 'RETAIL' | 'WHOLESALE';
}
declare class FullShippingAddressDto implements ShippingAddress {
    city: string;
    postOffice: string;
    recipientName: string;
    phoneNumber: string;
    cityRef?: string;
    warehouseRef?: string;
}
declare class MeetingDetailsDto {
    scheduledAt: string;
    location: string;
    notes?: string;
}
export declare class CreateOrderDto {
    cartItems: CartItemDto[];
    paymentMethod: 'ESCROW' | 'DIRECT';
    shippingMethod?: 'NOVA_POSHTA' | 'UKRPOSHTA' | 'MEETUP';
    shippingAddress?: FullShippingAddressDto;
    transactionHash?: string;
    checkoutMode?: 'CART' | 'DEPOSIT';
    escrowDepositAmount?: number;
    meetingDetails?: MeetingDetailsDto;
}
export {};
