// import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from './firebaseConfig';
import { UserSubscription, SingleStockPurchase } from './subscriptionService';

export interface UserSubscriptionData {
  userId: string;
  subscription: UserSubscription | null;
  singleStockPurchases: SingleStockPurchase[];
  registeredStocks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class FirestoreService {
  private static instance: FirestoreService;
  private mockMode = true;

  static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  async getUserSubscriptionData(userId: string): Promise<UserSubscriptionData | null> {
    if (this.mockMode) {
      return {
        userId,
        subscription: {
          planId: 'free',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        },
        singleStockPurchases: [],
        registeredStocks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    try {
      console.log('Mock: Getting user subscription data for', userId);
      return null;
    } catch (error) {
      console.error('Error getting user subscription data:', error);
      throw error;
    }
  }

  async createUserSubscriptionData(data: UserSubscriptionData): Promise<void> {
    if (this.mockMode) {
      console.log('Mock: Created user subscription data for', data.userId);
      return;
    }

    try {
      console.log('Mock: Creating user subscription data for', data.userId);
    } catch (error) {
      console.error('Error creating user subscription data:', error);
      throw error;
    }
  }

  async updateUserSubscription(userId: string, subscription: UserSubscription): Promise<void> {
    if (this.mockMode) {
      console.log('Mock: Updated subscription for', userId, subscription);
      return;
    }

    try {
      console.log('Mock: Updating subscription for', userId, subscription);
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  async addSingleStockPurchase(userId: string, purchase: SingleStockPurchase): Promise<void> {
    if (this.mockMode) {
      console.log('Mock: Added single stock purchase for', userId, purchase);
      return;
    }

    try {
      console.log('Mock: Adding single stock purchase for', userId, purchase);
    } catch (error) {
      console.error('Error adding single stock purchase:', error);
      throw error;
    }
  }

  async addRegisteredStock(userId: string, stockSymbol: string): Promise<void> {
    if (this.mockMode) {
      console.log('Mock: Added registered stock for', userId, stockSymbol);
      return;
    }

    try {
      console.log('Mock: Adding registered stock for', userId, stockSymbol);
    } catch (error) {
      console.error('Error adding registered stock:', error);
      throw error;
    }
  }

  async getUsersBySubscriptionPlan(planId: string): Promise<string[]> {
    if (this.mockMode) {
      return [];
    }

    try {
      console.log('Mock: Getting users by subscription plan', planId);
      return [];
    } catch (error) {
      console.error('Error getting users by subscription plan:', error);
      throw error;
    }
  }
}
