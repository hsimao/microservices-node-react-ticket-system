import mongoose from 'mongoose'
import { Order, OrderStatus } from './order'

interface TicketAttrs {
  title: string
  price: number
}

export interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs)
}

// 確認票券有沒有被保留
// 搜尋所有訂單內是否有相同票券
// 判斷訂單狀態是否建立 Created
// 判斷訂單狀態是否保留中 AwaitingPayment
// 判斷訂單狀態是否已完成 Complete
ticketSchema.methods.isReserved = async function() {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
    },
  })

  return !!existingOrder
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
