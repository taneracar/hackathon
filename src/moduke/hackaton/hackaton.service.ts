import { Injectable } from '@nestjs/common';
import { CreateHackatonDto } from './dto/create-hackaton.dto';
import { UpdateHackatonDto } from './dto/update-hackaton.dto';

@Injectable()
export class HackatonService {
  create(createHackatonDto: CreateHackatonDto) {
    return 'This action adds a new hackaton';
  }

  findAll() {
    return `This action returns all hackaton`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hackaton`;
  }

  update(id: number, updateHackatonDto: UpdateHackatonDto) {
    return `This action updates a #${id} hackaton`;
  }

  remove(id: number) {
    return `This action removes a #${id} hackaton`;
  }
}
