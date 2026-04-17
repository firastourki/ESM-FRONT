export interface LearningResource {
  id?: number;
  title: string;
  type: string;
  published: boolean;
  fileUrl?: string;
  assessmentId: number;
}
