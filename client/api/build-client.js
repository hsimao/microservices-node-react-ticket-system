import axios from 'axios'

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // We are on the server
    return axios.create({
      // 本地環境 dev 使用
      // baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
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
