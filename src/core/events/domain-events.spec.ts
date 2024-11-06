import { vi } from 'vitest'
import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'
import { DomainEvents } from './domain-events'

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date
  private aggregate: CustomAggregate; // eslint-disable-line

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate
    this.ocurredAt = new Date()
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id
  }
}

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null)

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))
    return aggregate
  }
}

describe('domain events', () => {
  it('should be able to dispatch and listen to events', () => {
    const callbackSpy = vi.fn()

    // Subscriber set (listening created answer event)
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

    // Creating an answer, but without saving it in db
    const aggregate = CustomAggregate.create()

    // Assuring event was created but not dispatched
    expect(aggregate.domainEvents).toHaveLength(1)

    // Saving answer in db, and dispatching event
    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    // Subscriber listen to event and do what is expected
    expect(callbackSpy).toHaveBeenCalled()

    expect(aggregate.domainEvents).toHaveLength(0)
  })
})
