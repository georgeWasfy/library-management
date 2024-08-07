import { PipeTransform, ArgumentMetadata } from '@nestjs/common';

export class TransformationPipe implements PipeTransform {
  constructor() {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    this.traverseValueObject(value);

    return value;
  }
  // support nested objects only [NO ARRAY SUPPORT]
  traverseValueObject(obj: any) {
    for (var k in obj) {
      if (typeof obj[k] == 'object' && obj[k] !== null)
        this.traverseValueObject(obj[k]);
      if (typeof obj[k] == 'string' && obj[k] !== null) {
        obj[k] = this.transformValues(obj[k]);
      }
    }
  }

  transformValues(value: string | boolean | number) {
    if (this.isTrue(value)) return true;
    if (this.isFalse(value)) return false;
    if (this.isNumeric(value)) return Number(value);
    return value;
  }

  protected isTrue(value: string | boolean | number): boolean {
    return value === true || value === 'true';
  }

  protected isFalse(value: string | boolean | number): boolean {
    return value === false || value === 'false';
  }

  protected isNumeric(value: any): boolean {
    if (typeof value != 'string' && typeof value != 'number') return false;
    return (
      !isNaN(value as number) &&
      !isNaN(parseFloat(value as string)) &&
      isFinite(value as any)
    );
  }
}
