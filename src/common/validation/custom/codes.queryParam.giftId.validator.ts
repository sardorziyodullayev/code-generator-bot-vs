import { ValidatorConstraint, ValidationArguments, isMongoId } from 'class-validator';

@ValidatorConstraint({ name: 'IsCodeGiftId', async: false })
export class IsCodeGiftId {
  validate(text: string, args: ValidationArguments) {
    return !args.constraints.find((arg) => arg === text) || !isMongoId(text);
  }

  defaultMessage(args: ValidationArguments) {
    return `giftId must mongoId or oneOf${JSON.stringify(args.constraints)}`;
  }
}
