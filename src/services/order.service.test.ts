import { describe, it, expect, vi } from 'vitest';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { Order } from '../models/order.model';

describe('OrderService', () => {
  const mockFetch = vi.fn();
  const mockPaymentService = {
    payViaLink: vi.fn(),
    buildPaymentMethod: vi.fn().mockReturnValue('mock-payment-method'),
  };

  const orderService = new OrderService(mockPaymentService as unknown as PaymentService, mockFetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate the order and throw an error if items are missing', async () => {
    const invalidOrder = { items: [] };

    await expect(orderService.process(invalidOrder)).rejects.toThrow('Order items are required');
  });

  it('should validate the order and throw an error if item prices or quantities are invalid', async () => {
    const invalidOrder = { items: [{ price: 0, quantity: 1, id: 'item1', productId: 'productId1' }] };

    await expect(orderService.process(invalidOrder)).rejects.toThrow('Order items are invalid');
  });

  it('should calculate the total price and process the order without a coupon', async () => {
    const validOrder: Partial<Order> = {
      items: [{ price: 100, quantity: 2, id: 'item2', productId: 'productId2' }],
    };

    mockFetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({}),
    });

    await orderService.process(validOrder);

    expect(mockPaymentService.payViaLink).toHaveBeenCalled();
  });

  it('should calculate the total price and process the order with multi products without a coupon', async () => {
    const validOrder: Partial<Order> = {
      items: [
        { price: 100, quantity: 2, id: 'item2', productId: 'productId2' },
        { price: 100, quantity: 2, id: 'item3', productId: 'productId3' },
        { price: 100, quantity: 2, id: 'item4', productId: 'productId4' },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({}),
    });

    await orderService.process(validOrder);

    expect(mockPaymentService.payViaLink).toHaveBeenCalled();
  });

  it('should calculate the total price and coupon discount is less than 0', async () => {
    const validOrder: Partial<Order> = {
    items: [{ price: 100, quantity: 2, id: 'item3', productId: 'productId3' }],
    couponId: 'test-coupon',
    };
    mockFetch
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({ discount: 300 }),
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({}),
      });;
    await orderService.process(validOrder);
    expect(mockPaymentService.payViaLink).toHaveBeenCalled();
  });

  it('should apply a coupon and process the order', async () => {
    const validOrder: Partial<Order> = {
      items: [{ price: 100, quantity: 2, id: 'item1', productId: 'productId1' }],
      couponId: 'test-coupon',
    };

    mockFetch
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({ discount: 50 }),
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({}),
      });

    await orderService.process(validOrder);

    expect(mockPaymentService.payViaLink).toHaveBeenCalled();
  });

  it('should apply a coupon and process the order multi products', async () => {
    const validOrder: Partial<Order> = {
      items: [
        { price: 100, quantity: 2, id: 'item1', productId: 'productId1' },
        { price: 100, quantity: 2, id: 'item2', productId: 'productId2' },
        { price: 100, quantity: 2, id: 'item3', productId: 'productId3' },
      ],
      couponId: 'test-coupon',
    };

    mockFetch
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({ discount: 50 }),
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({}),
      });

    await orderService.process(validOrder);

    expect(mockPaymentService.payViaLink).toHaveBeenCalled();
  });

  it('should handle invalid coupons and throw an error', async () => {
    const validOrder: Partial<Order> = {
      items: [{ price: 100, quantity: 2, id: 'item1', productId: 'productId1' }],
      couponId: 'invalid-coupon',
    };

    mockFetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(null),
    });

    await expect(orderService.process(validOrder)).rejects.toThrow('Invalid coupon');
  });
});
