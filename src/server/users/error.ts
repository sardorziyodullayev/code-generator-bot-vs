import { CommonException } from '../../common/errors/common.error';
import { StatusCodes } from '../../common/utility/status-codes';

export class UserException extends CommonException {
  public static NotFound() {
    return new UserException('user not found', StatusCodes.NOT_FOUND);
  }

  public static InvalidPassword() {
    return new UserException('Invalid password or username ');
  }

  public static Unauthorized(data: StatusCodes = StatusCodes.UNAUTHORIZED) {
    return new UserException(' Unauthorized ', data);
  }

  public static NotEnoughPermission(data = null) {
    return new UserException(' Not enough permission ', data);
  }

  public static InvalidComplexId(data = null) {
    return new UserException(' Invalid complex id ', data);
  }

  public static RequiredComplexId(data = null) {
    return new UserException(' Complex id required ', data);
  }

  // public static CannotDeleteAdmin(data = null) {
  //   return new UserException(` Cannot delete ${Role.Admin} `, data);
  // }

  public static CannotDeleteYourSelf(data = null) {
    return new UserException(' Cannot delete your self', data);
  }
}
