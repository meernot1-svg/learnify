export type UserRole = 'Mentor' | 'Student';
export type Subject = 'computer' | 'physics' | 'biology' | 'chemistry';
export type MaterialType = 'video' | 'book' | 'pdf';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  fullName: string;
  fatherName?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  achievements: string[];
  createdAt: any;
  level?: number;
  points?: number;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  type: MaterialType;
  url: string;
  mentorId: string;
  createdAt: any;
  isPrioritized?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  mentorId: string;
  materialIds: string[];
  createdAt: any;
  isPrioritized?: boolean;
}

export interface Progress {
  id: string;
  userId: string;
  materialId: string;
  status: 'completed';
  updatedAt: any;
}

export interface StudyReminder {
  id: string;
  userId: string;
  subject: Subject | string;
  topic: string;
  time: any;
  isNotified: boolean;
  createdAt: any;
}
