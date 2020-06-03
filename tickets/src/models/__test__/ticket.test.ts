import { Ticket } from '../ticket'

// 測試併發
// 當兩個 實例同時創建時，另一個不能儲存
it('implements optimistic concurrency control', async done => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  })

  // Save the ticket to the database
  await ticket.save()

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 })
  secondInstance!.set({ price: 15 })

  // save the first fetched ticket
  await firstInstance!.save()

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save()
  } catch (err) {
    return done()
  }

  throw new Error('Should not reach this point')
})

it('每次更新 version 都需要 + 1', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  })

  await ticket.save()
  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)

  await ticket.save()
  expect(ticket.version).toEqual(2)
})
