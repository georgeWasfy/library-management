import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod/lib';

export type ZodErrorType = {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
}[];
export class ValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException(
        JSON.stringify(this.formatError(error.issues)),
      );
    }
    return value;
  }
  formatError(errors: ZodErrorType) {
    let errorResponse: { [key: string]: string } = {};
    for (const err of errors) {
      errorResponse[err?.path?.join(' . ')] = err.message;
    }
    return errorResponse;
  }
}
