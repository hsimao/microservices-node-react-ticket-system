import request from 'supertest'
import { OrderStatus } from '@hsimao-tickets/common'
import { app } from '../../app'
import { Order } from '../../models/order'
import { stripe } from '../../stripe'

// jest.mock('../../stripe')

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

it('returns a 204 with valid inputs', async () => {
  const userId = await global.createMongoId()
  // 隨機金額，讓後續從 stripe 取得最新交易時當成 key 來搜尋
  const price = Math.floor(Math.random() * 100000)
  const order = Order.build({
    id: await global.createMongoId(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa', // stripe 測試模式會回傳成功的 token
      orderId: order.id,
    })
    .expect(201)

  // 使用 mock 測試
  // 取得送到 stripe charges.create api 的參數，並檢查
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
  // console.log('chargeOptions', chargeOptions)
  // expect(chargeOptions.source).toEqual('tok_visa')
  // expect(chargeOptions.amount).toEqual(order.price * 100)
  // expect(chargeOptions.currency).toEqual('TWD')

  // 從 stripe 取得最新 50 筆交易資料來檢查
  const stripeCharges = await stripe.charges.list({ limit: 50 })
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100
  })

  expect(stripeCharge).toBeDefined()
  expect(stripeCharge!.currency).toEqual('twd')
})
