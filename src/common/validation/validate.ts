import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CommonException } from '../errors/common.error';

export const validateIt = async <T>(data: any, classType: ClassConstructor<T>, groups: any): Promise<T> => {
  if (!data) {
    throw CommonException.ValidationError([
      {
        target: data,
        property: '',
        constraints: { isEmpty: 'Request body should be object' },
        value: data,
      },
    ]);
  }

  const classData = plainToClass(classType, data as T, {
    excludeExtraneousValues: false,
    enableCircularCheck: true,
    groups,
  });

  const errors = await validate(classData as any, { groups, whitelist: true });

  if (!errors || errors.length === 0) return classData;

  throw CommonException.ValidationError(errors);
};
