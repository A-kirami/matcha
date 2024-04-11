export interface Contact {
  type: 'user' | 'group'
  id: string
  name: string
  avatar: string
  isBot?: boolean
}

export interface UploadFile {
  name: string
  size: number
  type?: string | FileType
}

export interface FileType {
  mimeType: string
  extension: string
}
