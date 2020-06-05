import { Publisher, Subjects, TicketUpdatedEvent } from '@hsimao-tickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
