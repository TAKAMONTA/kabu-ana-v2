const knex = require('knex');
const knexConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';

// userServiceの関数をdbインスタンスを引数として受け取るように変更
const createUserService = (db) => ({
  findOrCreateUser: async (firebaseUid, email, name) => {
    try {
      let user = await db('users').where({ firebase_uid: firebaseUid }).first();

      if (!user) {
        const [userId] = await db('users').insert({
          firebase_uid: firebaseUid,
          email,
          name,
          created_at: new Date(),
          updated_at: new Date()
        });

        user = await db('users').where({ id: userId }).first();
      }

      return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  },

  getUserByFirebaseUid: async (firebaseUid) => {
    try {
      const user = await db('users').where({ firebase_uid: firebaseUid }).first();
      return user || null;
    } catch (error) {
      console.error('Error in getUserByFirebaseUid:', error);
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      const user = await db('users').where({ email: email }).first();
      return user || null;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }
});

// 本番環境では実際のdbインスタンスを渡してエクスポート
module.exports = process.env.NODE_ENV === 'test' 
  ? createUserService // テスト環境では関数をエクスポート
  : createUserService(knex(knexConfig[environment])); // それ以外では初期化済みのサービスをエクスポート
