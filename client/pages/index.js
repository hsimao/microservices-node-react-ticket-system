import buildClient from '../api/build-client'

const LandingPage = ({ currentUser }) => {
  console.log('I am in the componet', currentUser)
  return <h1>Landing Page</h1>
}

LandingPage.getInitialProps = async content => {
  const client = buildClient(content).get('/api/users/currentuser')
  const { data } = await client.get('/api/users/currentuser')

  return data
}

export default LandingPage
