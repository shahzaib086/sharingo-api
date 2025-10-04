import { DataSource } from 'typeorm';
import { Address } from '../../entities/address.entity';
import { Order, OrderStatus, DeliveryType } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Transaction, TransactionStatus } from '../../entities/transaction.entity';

export const orderSeeder = async (dataSource: DataSource) => {
  const addressRepository = dataSource.getRepository(Address);
  const orderRepository = dataSource.getRepository(Order);
  const orderItemRepository = dataSource.getRepository(OrderItem);
  const transactionRepository = dataSource.getRepository(Transaction);

  // Create sample addresses
  const addresses = [
    {
      label: 'home',
      name: 'John Doe',
      phoneNumber: '1234567890',
      countryCode: '+1',
      region: 'California',
      city: 'Los Angeles',
      postalCode: '90210',
      address: '123 Main St, Los Angeles, CA 90210',
      isDefault: true,
      userId: 1,
    },
    {
      label: 'office',
      name: 'John Doe',
      phoneNumber: '1234567890',
      countryCode: '+1',
      region: 'California',
      city: 'San Francisco',
      postalCode: '94102',
      address: '456 Business Ave, San Francisco, CA 94102',
      isDefault: false,
      userId: 1,
    },
  ];

  for (const addressData of addresses) {
    const existingAddress = await addressRepository.findOne({
      where: { userId: addressData.userId, label: addressData.label },
    });

    if (!existingAddress) {
      const address = addressRepository.create(addressData);
      await addressRepository.save(address);
    }
  }

  // Create sample orders
  const orders = [
    {
      orderNumber: 'GL-1703123456789-123',
      userId: 1,
      addressId: 1,
      subTotal: 99.99,
      discount: 10.00,
      voucherCode: 'SAVE10',
      deliveryCharges: 5.99,
      grandTotal: 99.99 + 5.99 - 10.00, // 95.98
      deliveryType: DeliveryType.DELIVERY,
      status: OrderStatus.PENDING,
      isPaid: false,
      deliveryDate: '27 Oct 2024 - 29 Oct 2024',
    },
    {
      orderNumber: 'GL-1703123456790-456',
      userId: 1,
      addressId: 2,
      subTotal: 149.99,
      discount: 0,
      voucherCode: undefined,
      deliveryCharges: 0,
      grandTotal: 149.99 + 0 - 0, // 149.99
      deliveryType: DeliveryType.PICKUP,
      status: OrderStatus.PROCESSING,
      isPaid: true,
      deliveryDate: '27 Oct 2024 - 29 Oct 2024',
    },
  ];

  for (const orderData of orders) {
    const existingOrder = await orderRepository.findOne({
      where: { orderNumber: orderData.orderNumber },
    });

    if (!existingOrder) {
      const order = orderRepository.create(orderData);
      const savedOrder = await orderRepository.save(order);

      if (!savedOrder) continue;

      // Create sample order items
      const orderItems = [
        {
          orderId: savedOrder.id,
          productId: 1,
          price: 49.99,
          qty: 2,
          total: 99.98,
        },
        {
          orderId: savedOrder.id,
          productId: 2,
          price: 50.00,
          qty: 1,
          total: 50.00,
        },
      ];

      for (const itemData of orderItems) {
        const orderItem = orderItemRepository.create(itemData);
        await orderItemRepository.save(orderItem);
      }

      // Create sample transactions
      const transactions = [
        {
          userId: savedOrder.userId,
          orderId: savedOrder.id,
          amount: savedOrder.grandTotal,
          transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: savedOrder.isPaid ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
          payload: JSON.stringify({ payment_method: 'credit_card' }),
        },
      ];

      for (const transactionData of transactions) {
        const transaction = transactionRepository.create(transactionData);
        await transactionRepository.save(transaction);
      }
    }
  }

  console.log('Order seeder completed');
}; 