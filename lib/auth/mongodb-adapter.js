import { MongoClient } from 'mongodb'
import { ObjectId } from 'mongodb'

/**
 * Custom MongoDB Adapter for NextAuth.js
 * Works with MongoDB 5.x
 */
export default function MongoDBAdapter(clientPromise) {
  return {
    async createUser(user) {
      const client = await clientPromise
      const result = await client
        .db()
        .collection('users')
        .insertOne({
          ...user,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        })
      
      const newUser = await client
        .db()
        .collection('users')
        .findOne({ _id: result.insertedId })
      
      return transformUser(newUser)
    },
    
    async getUser(id) {
      const client = await clientPromise
      const user = await client
        .db()
        .collection('users')
        .findOne({ _id: new ObjectId(id) })
      
      if (!user) return null
      return transformUser(user)
    },
    
    async getUserByEmail(email) {
      const client = await clientPromise
      const user = await client
        .db()
        .collection('users')
        .findOne({ email })
      
      if (!user) return null
      return transformUser(user)
    },
    
    async getUserByAccount({ provider, providerAccountId }) {
      const client = await clientPromise
      const account = await client
        .db()
        .collection('accounts')
        .findOne({ provider, providerAccountId })
      
      if (!account) return null
      
      const user = await client
        .db()
        .collection('users')
        .findOne({ _id: new ObjectId(account.userId) })
      
      if (!user) return null
      return transformUser(user)
    },
    
    async updateUser(user) {
      const client = await clientPromise
      const { _id, ...userData } = user
      
      const result = await client
        .db()
        .collection('users')
        .findOneAndUpdate(
          { _id: new ObjectId(_id) },
          { $set: {
              ...userData,
              emailVerified: userData.emailVerified ? new Date(userData.emailVerified) : null,
            } 
          },
          { returnDocument: 'after' }
        )
      
      return transformUser(result.value)
    },
    
    async linkAccount(account) {
      const client = await clientPromise
      const modifiedAccount = {
        ...account,
        userId: new ObjectId(account.userId),
      }
      
      await client
        .db()
        .collection('accounts')
        .insertOne(modifiedAccount)
      
      return account
    },
    
    async createSession(session) {
      const client = await clientPromise
      const modifiedSession = {
        ...session,
        userId: new ObjectId(session.userId),
        expires: new Date(session.expires),
      }
      
      await client
        .db()
        .collection('sessions')
        .insertOne(modifiedSession)
      
      return session
    },
    
    async getSessionAndUser(sessionToken) {
      const client = await clientPromise
      const session = await client
        .db()
        .collection('sessions')
        .findOne({ sessionToken })
      
      if (!session) return null
      
      const user = await client
        .db()
        .collection('users')
        .findOne({ _id: new ObjectId(session.userId) })
      
      if (!user) return null
      
      return {
        session: {
          ...session,
          expires: session.expires.toISOString(),
        },
        user: transformUser(user),
      }
    },
    
    async updateSession(session) {
      const client = await clientPromise
      const result = await client
        .db()
        .collection('sessions')
        .findOneAndUpdate(
          { sessionToken: session.sessionToken },
          { $set: {
              ...session,
              expires: new Date(session.expires),
            } 
          },
          { returnDocument: 'after' }
        )
      
      if (!result.value) return null
      
      return {
        ...result.value,
        expires: result.value.expires.toISOString(),
      }
    },
    
    async deleteSession(sessionToken) {
      const client = await clientPromise
      await client
        .db()
        .collection('sessions')
        .deleteOne({ sessionToken })
    },
    
    async createVerificationToken(verificationToken) {
      const client = await clientPromise
      const modifiedToken = {
        ...verificationToken,
        expires: new Date(verificationToken.expires),
      }
      
      await client
        .db()
        .collection('verification_tokens')
        .insertOne(modifiedToken)
      
      return verificationToken
    },
    
    async useVerificationToken({ identifier, token }) {
      const client = await clientPromise
      const result = await client
        .db()
        .collection('verification_tokens')
        .findOneAndDelete({ identifier, token })
      
      if (!result.value) return null
      
      return {
        ...result.value,
        expires: result.value.expires.toISOString(),
      }
    },
  }
}

// Helper to transform MongoDB users to NextAuth.js users
function transformUser(user) {
  if (!user) return null
  
  return {
    ...user,
    id: user._id.toString(),
    emailVerified: user.emailVerified?.toISOString() || null,
  }
}