import request from 'supertest'
import { app } from '../../app'

it('returns a 201 on successful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)
})

it('returns a 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: '1234',
      password: 'password',
    })
    .expect(400)
})

it('returns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@gmail.com',
      password: 'p',
    })
    .expect(400)
})

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@gmail.com' })
    .expect(400)

  await request(app)
    .post('/api/users/signup')
    .send({ password: 'password' })
    .expect(400)
})

it('email 重複回傳 400', async () => {
  // 重複發送兩次請求, 模擬重複
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@gmail.com', password: 'password' })
    .expect(201)

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@gmail.com', password: 'password' })
    .expect(400)
})
