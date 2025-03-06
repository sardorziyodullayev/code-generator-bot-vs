import { StatusCodes } from '../../../common/utility/status-codes';
import { CommonException } from './../../../common/errors/common.error';

export class DashboardException extends CommonException {
  public static TimeFormatError() {
    return new DashboardException('from or to time format invalid', StatusCodes.BAD_REQUEST);
  }
}
