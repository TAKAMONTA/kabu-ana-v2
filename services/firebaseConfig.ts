
interface MockUser {
  uid: string;
  email: string;
}

interface MockAuth {
  currentUser: MockUser | null;
  onAuthStateChanged: (callback: (user: MockUser | null) => void) => () => void;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<{ user: MockUser }>;
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<{ user: MockUser }>;
  signOut: () => Promise<void>;
}

class MockFirebaseAuth implements MockAuth {
  currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback);
    setTimeout(() => callback(this.currentUser), 100);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    if (email && password.length >= 6) {
      const user: MockUser = {
        uid: 'mock-user-' + Date.now(),
        email: email
      };
      this.currentUser = user;
      this.notifyListeners();
      return { user };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    if (email && password.length >= 6) {
      const user: MockUser = {
        uid: 'mock-user-' + Date.now(),
        email: email
      };
      this.currentUser = user;
      this.notifyListeners();
      return { user };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  async signOut() {
    this.currentUser = null;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }
}

export const auth = new MockFirebaseAuth();

export const onAuthStateChanged = auth.onAuthStateChanged.bind(auth);
export const signInWithEmailAndPassword = auth.signInWithEmailAndPassword.bind(auth);
export const createUserWithEmailAndPassword = auth.createUserWithEmailAndPassword.bind(auth);
export const signOut = auth.signOut.bind(auth);

export interface User {
  uid: string;
  email: string;
}
