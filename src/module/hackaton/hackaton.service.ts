import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service';
import { CreateHackatonDto } from './dto/create-hackaton.dto';
import { UpdateHackatonDto } from './dto/update-hackaton.dto';

@Injectable()
export class HackatonService {
  constructor(private readonly prisma: PrismaService) {}

  create(createHackatonDto: CreateHackatonDto, authorId: string) {
    return this.prisma.hackaton.create({
      data: { ...createHackatonDto, authorId },
    });
  }

  findAll() {
    return this.prisma.hackaton.findMany();
  }

  async findOne(id: string) {
    const hackaton = await this.prisma.hackaton.findUnique({ where: { id } });

    if (!hackaton) {
      throw new NotFoundException(`Hackaton with id ${id} not found`);
    }

    return hackaton;
  }

  async update(id: string, updateHackatonDto: UpdateHackatonDto, userId: string) {
    const hackaton = await this.findOne(id);

    if (hackaton.authorId !== userId) {
      throw new ForbiddenException('Only the author can update this hackaton');
    }

    return this.prisma.hackaton.update({
      where: { id },
      data: updateHackatonDto,
    });
  }

  async remove(id: string, userId: string) {
    const hackaton = await this.findOne(id);

    if (hackaton.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this hackaton');
    }

    return this.prisma.hackaton.delete({ where: { id } });
  }
}
