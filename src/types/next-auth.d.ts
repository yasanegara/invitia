import type { UserRole } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id:    string
      name:  string | null
      email: string
      image: string | null
      role:  UserRole
    }
  }

  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:   string
    role: UserRole
  }
}
