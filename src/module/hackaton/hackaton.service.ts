import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async join(hackatonId: string, userId: string) {
    await this.findOne(hackatonId);

    const existingParticipant = await this.prisma.hackatonParticipant.findUnique({
      where: { hackatonId_userId: { hackatonId, userId } },
    });

    if (existingParticipant) {
      throw new ConflictException('You have already joined this hackaton');
    }

    return this.prisma.hackatonParticipant.create({
      data: { hackatonId, userId },
    });
  }

  async leave(hackatonId: string, userId: string) {
    await this.findOne(hackatonId);

    const existingParticipant = await this.prisma.hackatonParticipant.findUnique({
      where: { hackatonId_userId: { hackatonId, userId } },
    });

    if (!existingParticipant) {
      throw new NotFoundException('You have not joined this hackaton');
    }

    return this.prisma.hackatonParticipant.delete({
      where: { hackatonId_userId: { hackatonId, userId } },
    });
  }

  async findParticipants(hackatonId: string) {
    await this.findOne(hackatonId);

    return this.prisma.hackatonParticipant.findMany({
      where: { hackatonId },
      include: { user: true },
    });
  }
}
