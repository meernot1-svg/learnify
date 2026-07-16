import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  or,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, Material, Course, Progress, Subject, StudyReminder } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

const DB_TIMEOUT = 30000; // 30 seconds to allow for cold starts and rule evaluations

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = DB_TIMEOUT): Promise<T> {
  let timerId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      console.error(`[TIMEOUT] Operation exceeded ${timeoutMs}ms`);
      reject(new Error(`Operation timed out (${timeoutMs}ms). Check your connection or mentor permissions.`));
    }, timeoutMs);
  });

  return Promise.race([
    promise.then(res => {
      clearTimeout(timerId);
      return res;
    }),
    timeoutPromise
  ]);
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isTimeout = error instanceof Error && error.message.includes('timed out');
  const isOfflineError = isTimeout || (error instanceof Error && (
    error.message.includes('offline') || 
    error.message.includes('unavailable') ||
    error.message.includes('deadline-exceeded')
  ));

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }

  // Log all errors to console
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));

  // ALWAYS throw for writes/deletes/updates to prevent UI hangs on silent failures
  if (operationType === OperationType.WRITE || 
      operationType === OperationType.DELETE || 
      operationType === OperationType.UPDATE || 
      operationType === OperationType.CREATE) {
    throw new Error(JSON.stringify(errInfo));
  }

  if (!isOfflineError) {
    throw new Error(JSON.stringify(errInfo));
  }
}

export const dbService = {
  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      // Default getDoc handles cache automatically
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch (error: any) {
      // If we are offline, we might want to still try and check cache 
      // but getDoc usually does that. If it throws here, even cache failed.
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.uid}`;
    try {
      await withTimeout(setDoc(doc(db, 'users', profile.uid), {
        ...profile,
        points: profile.points || 0,
        achievements: profile.achievements || [],
        createdAt: serverTimestamp()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      await withTimeout(updateDoc(doc(db, 'users', uid), data as any));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updatePoints(userId: string, pointsToAdd: number): Promise<void> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await withTimeout(getDoc(userRef));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const currentPoints = data.points || 0;
        const currentAchievements = data.achievements || [];
        const newPoints = currentPoints + pointsToAdd;
        
        const newAchievements = [...currentAchievements];
        const badges = [
          { name: 'Novice Ops', threshold: 100 },
          { name: 'Veteran Agent', threshold: 500 },
          { name: 'Mission Master', threshold: 1000 },
          { name: 'Tactical Genius', threshold: 2500 }
        ];

        badges.forEach(badge => {
          if (newPoints >= badge.threshold && !newAchievements.includes(badge.name)) {
            newAchievements.push(badge.name);
          }
        });

        await withTimeout(updateDoc(userRef, {
          points: newPoints,
          achievements: newAchievements
        }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getLeaderboard(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(10)
      );
      const snapshot = await withTimeout(getDocs(q));
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  // Materials
  async getMaterials(subject?: Subject): Promise<Material[]> {
    const path = 'materials';
    try {
      const col = collection(db, 'materials');
      const q = subject 
        ? query(col, where('subject', '==', subject), orderBy('createdAt', 'desc'))
        : query(col, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Material));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async createMaterial(material: Omit<Material, 'id' | 'createdAt' | 'mentorId'>): Promise<void> {
    const path = 'materials';
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Authentication required");
      
      const ref = doc(collection(db, 'materials'));
      await withTimeout(setDoc(ref, {
        ...material,
        mentorId: uid,
        createdAt: serverTimestamp()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteMaterial(id: string): Promise<void> {
    const path = `materials/${id}`;
    console.log(`[DB] Delete doc: ${path}`);
    try {
      await withTimeout(deleteDoc(doc(db, 'materials', id)));
      console.log(`[DB] Delete doc SUCCESS: ${path}`);
    } catch (error) {
      console.error(`[DB] Delete doc FAILED: ${path}`, error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Admin utility to purge everything if stuck
  async purgeAllData(): Promise<void> {
    console.log("[DB] Purging ALL materials and courses...");
    try {
      const mats = await withTimeout(getDocs(collection(db, 'materials')), 30000);
      const courses = await withTimeout(getDocs(collection(db, 'courses')), 30000);
      
      const promises = [
        ...mats.docs.map(d => deleteDoc(d.ref)),
        ...courses.docs.map(d => deleteDoc(d.ref))
      ];
      
      await withTimeout(Promise.all(promises), 60000);
      console.log("[DB] Purge complete.");
    } catch (e: any) {
      console.error("[DB] Purge FAILED:", e);
      throw e;
    }
  },

  async toggleMaterialPriority(id: string, current: boolean): Promise<void> {
    const path = `materials/${id}`;
    try {
      await withTimeout(updateDoc(doc(db, 'materials', id), {
        isPrioritized: !current
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Courses
  async getCourses(subject?: Subject): Promise<Course[]> {
    const path = 'courses';
    try {
      const col = collection(db, 'courses');
      const q = subject 
        ? query(col, where('subject', '==', subject), orderBy('createdAt', 'desc'))
        : query(col, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'mentorId'>): Promise<void> {
    const path = 'courses';
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Authentication required");

      const ref = doc(collection(db, 'courses'));
      await withTimeout(setDoc(ref, {
        ...course,
        mentorId: uid,
        createdAt: serverTimestamp()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async awardBadge(userId: string, badge: string): Promise<void> {
    const path = `users/${userId}`;
    try {
      const ref = doc(db, 'users', userId);
      await withTimeout(updateDoc(ref, {
        achievements: arrayUnion(badge)
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCourse(id: string): Promise<void> {
    const path = `courses/${id}`;
    try {
      await withTimeout(deleteDoc(doc(db, 'courses', id)));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async toggleCoursePriority(id: string, current: boolean): Promise<void> {
    const path = `courses/${id}`;
    try {
      await withTimeout(updateDoc(doc(db, 'courses', id), {
        isPrioritized: !current
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Progress
  async getStudentProgress(userId: string): Promise<Progress[]> {
    const path = `progress`;
    try {
      const q = query(collection(db, 'progress'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Progress));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async markComplete(userId: string, materialId: string): Promise<void> {
    const path = 'progress';
    try {
      const id = `${userId}_${materialId}`;
      const ref = doc(db, 'progress', id);
      const snap = await getDoc(ref);
      
      // If already complete, don't award points again
      if (snap.exists() && snap.data()?.status === 'completed') return;

      await withTimeout(setDoc(ref, {
        userId,
        materialId,
        status: 'completed',
        updatedAt: serverTimestamp()
      }));

      // Grant points for completing a module
      await this.updatePoints(userId, 20);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Student Management
  async getStudents(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'Student'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  // Reminders
  async getReminders(userId: string): Promise<StudyReminder[]> {
    const path = 'reminders';
    try {
      const q = query(
        collection(db, 'reminders'),
        where('userId', '==', userId),
        orderBy('time', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyReminder));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async createReminder(reminder: Omit<StudyReminder, 'id' | 'createdAt' | 'userId' | 'isNotified'>): Promise<void> {
    const path = 'reminders';
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Authentication required");

      const ref = doc(collection(db, 'reminders'));
      await withTimeout(setDoc(ref, {
        ...reminder,
        userId: uid,
        isNotified: false,
        createdAt: serverTimestamp()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteReminder(id: string): Promise<void> {
    const path = `reminders/${id}`;
    try {
      await withTimeout(deleteDoc(doc(db, 'reminders', id)));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async markReminderNotified(id: string): Promise<void> {
    const path = `reminders/${id}`;
    try {
      await withTimeout(updateDoc(doc(db, 'reminders', id), {
        isNotified: true
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
