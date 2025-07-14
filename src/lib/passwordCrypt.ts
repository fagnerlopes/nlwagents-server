import bcrypt from 'bcryptjs'

export async function getHashFromPassword(password: string) {
  try {
    return await bcrypt.hash(password, 10)
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function verifyPasswordFromHash(
  password: string,
  hashPassword: string
) {
  try {
    return await bcrypt.compare(password, hashPassword)
  } catch (error) {
    console.error(error)
    return false
  }
}
