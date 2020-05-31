import nats, { Message, Stan } from 'node-nats-streaming'
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
    .setDeliverAllAvailable() // 每次重啟 listen port 都會重新執行之前執行過的所有 subscrip 任務
    .setDurableName('accounting-service') // 將會記錄訂閱狀態，有發出去成功後會標記，將在下次重啟時不用在重新發送

  const subscription = stan.subscribe('ticket:created', 'queue-group-name', options)

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

abstract class Listener {
  abstract subject: string
  abstract queueGroupName: string
  abstract onMessage(data: any, msg: Message): void
  private client: Stan
  protected ackWait = 5 * 1000

  constructor(client: Stan) {
    this.client = client
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }

  listen() {
    const subscription = this.client.subscribe(this.subject, this.queueGroupName, this.subscriptionOptions())

    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`)
      const parsedData = this.parseMessage(msg)
      this.onMessage(parsedData, msg)
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData()
    return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'))
  }
}

class TicketCreatedListener extends Listener {
  subject = 'ticket:created'
  queueGroupName = 'payments-service'

  onMessage(data: any, msg: Message) {
    console.log('Event data!', data)

    msg.ack()
  }
}
