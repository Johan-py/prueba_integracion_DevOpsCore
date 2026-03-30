const users = [
  { id: 1, name: 'User 1' },
  { id: 2, name: 'User 2' }
]
type payload = {
  name: string
}
export const getUsersRepository = async () => {
  return users
}

export const createUserRepository = async (data: payload) => {
  const newUser = {
    id: users.length + 1,
    ...data
  }

  users.push(newUser)

  return newUser
}
