export enum OrderStatus {
  // 建立訂單，但票券尚未保留
  Created = 'created',

  // 要保留的票券已經被其他人保留了
  // 訂單被取消
  // 訂單已經過期、尚未付款
  Cancelled = 'cancelled',

  // 訂單已成功保留票券
  AwaitingPayment = 'awaiting:payment',

  // 訂單已經保留且付款成功
  Complete = 'complete',
}
