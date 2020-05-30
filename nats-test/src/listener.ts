import nats, { Message } from 'node-nats-streaming'
import { randomBytes } from 'crypto'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
})

stan.on('connect', () => {
  console.log('Listener connected to NATS')

  stan.on('close', () => {
    console.log('NATS connection closed!')
    process.exit()
  })

  const options = stan
    .subscriptionOptions()
    // 手動判斷是否接收成功，若 30 秒內沒有成功將會自動找另外的 queue 發送, 直到成功
    .setManualAckMode(true)

  const subscription = stan.subscribe('ticket:created', 'orders-service-queue-group', options)

  subscription.on('message', (msg: Message) => {
    const data = msg.getData()

    if (typeof data === 'string') {
      console.log('data', data)
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`)
    }

    msg.ack() // 確認接收成功
  })
})

process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())
