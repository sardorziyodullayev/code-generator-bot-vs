import { StatusCodes } from '../../common/utility/status-codes';
import { CommonException } from './../../common/errors/common.error';

export class GiftException extends CommonException {
  public static NotFound() {
    return new GiftException('Gift not found', StatusCodes.NOT_FOUND);
  }

  public static CannotDelete(data) {
    return new CommonException('Cannot delete this gift! ', data);
  }
}
