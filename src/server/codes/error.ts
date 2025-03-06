import { StatusCodes } from '../../common/utility/status-codes';
import { CommonException } from './../../common/errors/common.error';

export class CodeException extends CommonException {
  public static NotFound() {
    return new CodeException('Code not found', StatusCodes.NOT_FOUND);
  }

  public static CannotDelete(data) {
    return new CommonException('Cannot delete this gift! ', data);
  }
}
