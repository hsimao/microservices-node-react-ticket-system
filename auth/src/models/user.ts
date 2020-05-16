import mongoose from 'mongoose'

interface UserAttrs {
  email: string
  password: string
}

interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): any
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
})

// 使用 mongoose statics 新增一個 build 方法, 回傳 new User
// 並與 typescript 的 UserAttrs 做關聯
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<any, UserModel>('User', userSchema)

const buildUser = (attrs: UserAttrs) => {
  return new User(attrs)
}

// 測試 typescript 效驗
// User.build({
//   email: '3040',
//   password: '122',
//   age: 30, // 此屬性 UserAttrs 沒有, typtscript 會警告
// })

export { User }
