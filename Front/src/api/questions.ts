import api from './axios'

export interface AnswerResponse {
  id: number
  content: string
  authorId: number
  authorName: string
  instructorAnswer: boolean
  createdAt: string
  updatedAt: string
}

export interface QuestionResponse {
  id: number
  courseId: number
  title: string
  content: string
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
  answers: AnswerResponse[]
}

export interface QuestionSummary {
  id: number
  courseId: number
  title: string
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
  answerCount: number
}

export const getCourseQuestions = (courseId: number): Promise<QuestionSummary[]> =>
  api.get(`/api/questions/courses/${courseId}`)

export const getQuestion = (questionId: number): Promise<QuestionResponse> =>
  api.get(`/api/questions/${questionId}`)

export const createQuestion = (data: { courseId: number; title: string; content: string }): Promise<QuestionResponse> =>
  api.post('/api/questions', data)

export const updateQuestion = (questionId: number, data: { title: string; content: string }): Promise<QuestionResponse> =>
  api.put(`/api/questions/${questionId}`, data)

export const createAnswer = (questionId: number, content: string): Promise<AnswerResponse> =>
  api.post(`/api/questions/${questionId}/answers`, { content })

export const updateAnswer = (questionId: number, answerId: number, content: string): Promise<AnswerResponse> =>
  api.put(`/api/questions/${questionId}/answers/${answerId}`, { content })

export const deleteQuestion = (questionId: number): Promise<void> =>
  api.delete(`/api/questions/${questionId}`)

export const deleteAnswer = (questionId: number, answerId: number): Promise<void> =>
  api.delete(`/api/questions/${questionId}/answers/${answerId}`)
