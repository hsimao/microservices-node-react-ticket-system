import { Subjects, Publisher, OrderCancelledEvent } from '@hsimao-tickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
