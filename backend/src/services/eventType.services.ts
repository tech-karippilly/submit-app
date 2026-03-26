import { EventType, IEventType } from '../models/EventType';

export interface CreateEventTypeInput {
  name: string;
  description?: string;
}

export interface UpdateEventTypeInput {
  name?: string;
  description?: string;
}

export const createEventType = async (input: CreateEventTypeInput): Promise<IEventType> => {
  const eventType = await EventType.create(input);
  return eventType;
};

export const getAllEventTypes = async (): Promise<IEventType[]> => {
  const types = await EventType.find({}).sort({ createdAt: -1 });
  return types;
};

export const getEventTypeById = async (id: string): Promise<IEventType | null> => {
  const type = await EventType.findById(id);
  return type;
};

export const updateEventType = async (
  id: string,
  input: UpdateEventTypeInput
): Promise<IEventType | null> => {
  const type = await EventType.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return type;
};

export const deleteEventType = async (id: string): Promise<boolean> => {
  const type = await EventType.findById(id);

  if (!type) {
    return false;
  }

  await type.deleteOne();
  return true;
};
