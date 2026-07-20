import { PartialType } from '@nestjs/mapped-types';
import { CreateHackatonDto } from './create-hackaton.dto';

export class UpdateHackatonDto extends PartialType(CreateHackatonDto) {}
