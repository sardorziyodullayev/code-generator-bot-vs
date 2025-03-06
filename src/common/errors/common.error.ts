import { ValidationError } from 'class-validator';
import { StatusCodes } from '../utility/status-codes';

export class CommonException {
  public readonly meta: {
    errors: ValidationError[];
    time?: Date;
  };
  static success = false;

  constructor(
    public readonly message: string,
    public readonly statusCode: StatusCodes = StatusCodes.BAD_REQUEST,
    errors: ValidationError[] = [],
    public readonly code: string = '10000',
  ) {
    this.meta = {
      time: new Date(),
      errors: errors,
    };
  }

  public static UnknownError(message = 'Unknown error', statusCode?: StatusCodes) {
    return new CommonException(message, statusCode);
  }

  public static ValidationError(errors?: ValidationError[]) {
    return new CommonException('Validation Error', StatusCodes.BAD_REQUEST, errors);
  }

  static AllreadyExist(message: string) {
    return new CommonException(`Already exist , message: ${message}`, StatusCodes.BAD_REQUEST);
  }

  public static NotFound() {
    return new CommonException('Not found', StatusCodes.NOT_FOUND);
  }

  public static InternalServerError() {
    return new CommonException('Internal server error', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export class FileException {
  public static InvalidFileType(errors: ValidationError[] = []) {
    return new CommonException('Invalid file type', StatusCodes.BAD_REQUEST, errors);
  }
}
