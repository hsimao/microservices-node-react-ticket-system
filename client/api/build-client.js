import axios from 'axios'

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // We are on the server
    return axios.create({
      baseURL: 'http://www.hsimao-ticketing.xyz',
      headers: req.headers,
    })
  } else {
    // We must be on the browser
    return axios.create({
      baseURL: '/',
    })
  }
}
