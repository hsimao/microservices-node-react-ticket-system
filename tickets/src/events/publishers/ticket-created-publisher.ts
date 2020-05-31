import { Publisher, Subjects, TicketCreatedEvent } from '@hsimao-tickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}
