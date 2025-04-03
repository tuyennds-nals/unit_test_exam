import { Order } from '../models/order.model';
import { PaymentService } from './payment.service';

export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly fetch: typeof globalThis.fetch = globalThis.fetch,
  ) {}

  async process(order: Partial<Order>) {
    this.validateOrder(order);

    let totalPrice = order.items!.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (order.couponId) {
      totalPrice = await this.applyCoupon(order.couponId, totalPrice);
    }

    const orderPayload = this.buildOrderPayload(order, totalPrice);

    const createdOrder = await this.createOrder(orderPayload);

    this.paymentService.payViaLink(createdOrder);
  }

  private validateOrder(order: Partial<Order>) {
    if (!order.items?.length) {
      throw new Error('Order items are required');
    }

    if (order.items.some(item => item.price <= 0 || item.quantity <= 0)) {
      throw new Error('Order items are invalid');
    }
  }

  private async applyCoupon(couponId: string, totalPrice: number): Promise<number> {
    const response = await this.fetch(`https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons/${couponId}`);
    const coupon = await response.json();

    if (!coupon) {
      throw new Error('Invalid coupon');
    }

    totalPrice -= coupon.discount;

    return totalPrice < 0 ? 0 : totalPrice;
  }

  private buildOrderPayload(order: Partial<Order>, totalPrice: number) {
    return {
      ...order,
      totalPrice,
      paymentMethod: this.paymentService.buildPaymentMethod(totalPrice),
    };
  }

  private async createOrder(orderPayload: any) {
    const orderResponse = await this.fetch('https://67eb7353aa794fb3222a4c0e.mockapi.io/order', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    return await orderResponse.json();
  }
}
