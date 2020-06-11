import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft / 1000))
    }

    findTimeLeft()
    const timerId = setInterval(findTimeLeft, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [order])

  if (timeLeft < 0) {
    return <div>Order Expired</div>
  }

  return (
    <div>
      <h3>Time left to pay: {timeLeft} seconds</h3>
      <StripeCheckout
        token={token => console.log(token)}
        stripeKey='pk_test_51Gs5dsH4buQ70U1Z7x9m8IpH7Z4b1dec2RxtZB5KA4WzlU4PccVvXCIinYSAjjKZqvuAQKPxzy3vOBcbGjjs4YP6001gEkUbb9'
        amount={order.ticket.price * 100}
        email={currentUser.email}
        currency='TWD'
        locale='auto'
      />
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query
  const { data } = await client.get(`/api/orders/${orderId}`)

  return { order: data }
}

export default OrderShow