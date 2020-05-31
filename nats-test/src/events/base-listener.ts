import { Message, Stan } from 'node-nats-streaming'

export abstract class Listener {
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
      .setDeliverAllAvailable() // 每次重啟 listen port 都會重新執行之前執行過的所有 subscrip 任務
      .setManualAckMode(true) // 手動判斷是否接收成功，若失敗將會在 30秒(預設) 後自動找另外的 queue 發送, 直到成功
      .setAckWait(this.ackWait) // 若失敗後幾秒後要重新發送 (預設30秒)
      .setDurableName(this.queueGroupName) // 將會記錄訂閱狀態，有發出去成功後會標記，將在下次重啟時不用在重新發送
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
