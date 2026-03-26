export type Role = 'OWNER' | 'EDITOR' | 'VIEWER'

export interface OnlineUser {
  userId: string
  name: string
  avatar?: string | null
  role?: Role
}

export interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
  ownerId: string
  members: any[]
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved'