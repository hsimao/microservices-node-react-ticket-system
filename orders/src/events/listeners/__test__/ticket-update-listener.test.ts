import { Message } from 'node-nats-streaming'
import { TicketUpdatedEvent } from '@hsimao-tickets/common'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // Create and save a ticket
  const id = await global.createMongoId()
  const ticket = Ticket.build({
    id,
    title: 'concert',
    price: 20,
  })
  await ticket.save()

  // Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 999,
    userId: '12333',
  }

  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  // return all of thsi stuff
  return { listener, data, ticket, msg }
}

it('finds, updates, and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { msg, data, listener } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

// 當 version 號碼不是下一個，則不能呼叫 ack
it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener } = await setup()

  data.version = 10
  try {
    await listener.onMessage(data, msg)
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled()
})
