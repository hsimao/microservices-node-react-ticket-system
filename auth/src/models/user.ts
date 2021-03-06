import mongoose from 'mongoose'
import { Password } from '../services/password'

// 新增用戶的請求參數
interface UserAttrs {
  email: string
  password: string
}

// user model 新增 build 方式, 並關聯 UserAttrs interface
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

// 創建 user 成功後需回傳的資料格式
interface UserDoc extends mongoose.Document {
  email: string
  password: string
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // 將查詢 user 資料時返回的資料格式化, 將 _id 改為 id, 並將敏感與多餘屬性刪除
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
      },
    },
  }
)

// 在將 user 資料儲存到 mongo 之前先將密碼加密
userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done()
})

// 使用 mongoose statics 新增一個 build 方法, 回傳 new User
// 並與 typescript 的 UserAttrs 做關聯
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

// 測試 input 參數效驗
// User.build({
//   email: '3040',
//   password: '122',
//   age: 30, // 此屬性 UserAttrs 沒有, typtscript 會警告
// })

// 測試 return 參數效驗
// const user = User.build({
//   email: 'test@gmail.com',
//   password: '12344',
// })
// user.email
// user.password
// user.updatedAt // 此屬性沒有定義, typescript 會警告

export { User }
