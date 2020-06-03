import { Subjects, Publisher, OrderCreatedEvent } from '@hsimao-tickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}
