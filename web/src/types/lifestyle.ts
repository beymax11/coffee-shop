export interface LifestyleComment {
  id: number;
  username: string;
  text: string;
  time: string;
}

export interface LifestylePost {
  id: number;
  imageUrl: string;
  username: string;
  likes: number;
  commentsCount: number;
  caption: string;
  date: string;
  comments: LifestyleComment[];
  location: string;
  status?: string;
}
