import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@hsimao-tickets/common'
import { Ticket } from '../models/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    })

    await ticket.save()

    // 不使用用戶直接傳遞的 title、price, 而使用 mongo 返回的 ticket.title ... 可確保資料是經過 mongoose 過濾過且真正儲存到資料庫的資料
    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    })

    res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
