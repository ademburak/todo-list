export interface User {
  _id: string
  username: string
  password: string
}

export interface List {
  _id: string
  name: string
  userId: string
  itemCount?: number
}

export interface Item {
  _id: string
  title: string
  detail?: string
  dateAdded: string
  listId: string
  completed: boolean
}
