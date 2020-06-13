import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@hsimao-tickets/common'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

// 訂單過期時間 15 分鐘
const EXPIRATION_WINDOW_SECONDS = 1 * 60

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input)) // 驗證 ticketId 是否符合 mongo id 格式
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body

    // 找出訂單內要購買的票券
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      throw new NotFoundError()
    }

    // 確認票券有沒有被保留
    const isReserved = await ticket.isReserved()
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved')
    }

    // 算出訂單過期時間
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // 建立訂單並儲存到 database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    })
    await order.save()

    // 發出訂單已經建立通知 Publish event
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    })

    res.status(201).send(order)
  }
)

export { router as createOrderRouter }
