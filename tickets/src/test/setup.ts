import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../app'
import jwt from 'jsonwebtoken'

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[]
    }
  }
}

let mongo: any

beforeAll(async () => {
  process.env.JWT_KEY = 'test'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

// 進行每次測試前, 刪除所有 mongo 資料
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

// 封裝常用註冊邏輯到 global
global.signin = () => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: 'zoidsj133',
    email: 'test@gmail.com',
  }

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token }

  // Trun that session into JSON
  const sessionJSON = JSON.stringify(session)

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  // return a string thats the cookie with the encode data
  return [`express:sess=${base64}`]
}
