import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { makeAnswer } from 'test/factories/make-answer'
import { makeAnswerAttachment } from 'test/factories/make-answer-attachment'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { DeleteAnswerUseCase } from './delete-answer'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let deleteAnswer: DeleteAnswerUseCase

describe('Delete Answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    deleteAnswer = new DeleteAnswerUseCase(inMemoryAnswersRepository)
  })

  it('should be able to delete a answer', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityID('author-1'),
      },
      new UniqueEntityID('answer-1'),
    )

    inMemoryAnswersRepository.create(newAnswer)

    inMemoryAnswerAttachmentsRepository.items.push(
      makeAnswerAttachment({
        answerId: newAnswer.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeAnswerAttachment({
        answerId: newAnswer.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    await deleteAnswer.execute({
      answerId: 'answer-1',
      authorId: 'author-1',
    })

    expect(inMemoryAnswersRepository.items).toHaveLength(0)
    expect(inMemoryAnswerAttachmentsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a answer from another user', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityID('author-1'),
      },
      new UniqueEntityID('answer-1'),
    )

    inMemoryAnswersRepository.create(newAnswer)

    const result = await deleteAnswer.execute({
      answerId: 'answer-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
