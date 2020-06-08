import { OrderCancelledEvent, OrderStatus } from '@hsimao-tickets/common'
import { Message } from 'node-nats-streaming'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { Order } from '../../../models/order'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = Order.build({
    id: await global.createMongoId(),
    status: OrderStatus.Created,
    price: 10,
    userId: '12345',
    version: 0,
  })
  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: '12345',
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg, order }
}

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup()

  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
