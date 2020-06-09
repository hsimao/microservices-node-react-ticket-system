import request from 'supertest'
import { OrderStatus } from '@hsimao-tickets/common'
import { app } from '../../app'
import { Order } from '../../models/order'

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: '123456',
      orderId: await global.createMongoId(),
    })
    .expect(404)
})

it('returns a 401 then purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: await global.createMongoId(),
    userId: await global.createMongoId(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: '123456',
      orderId: order.id,
    })
    .expect(401)
})

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = await global.createMongoId()

  const order = Order.build({
    id: await global.createMongoId(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: '1234567',
    })
    .expect(400)
})
