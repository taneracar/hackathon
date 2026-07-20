import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';
import { AppModule } from './app.module';

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): { property: string; message: string }[] {
  return errors.flatMap((error) => {
    const property = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.children?.length) {
      return flattenValidationErrors(error.children, property);
    }

    return Object.values(error.constraints ?? {}).map((message) => ({
      property,
      message,
    }));
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth to handle the raw request body
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(flattenValidationErrors(errors)),
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
