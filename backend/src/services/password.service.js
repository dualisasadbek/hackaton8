import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

class PasswordService {
  hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS)
  }

  compare(password, hash) {
    return bcrypt.compare(password, hash)
  }
}

export default new PasswordService()
