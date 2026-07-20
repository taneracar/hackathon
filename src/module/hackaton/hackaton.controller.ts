import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { HackatonService } from './hackaton.service';
import { CreateHackatonDto } from './dto/create-hackaton.dto';
import { UpdateHackatonDto } from './dto/update-hackaton.dto';

@Controller('hackaton')
@UseGuards(AuthGuard)
export class HackatonController {
  constructor(private readonly hackatonService: HackatonService) {}

  @Post()
  create(@Body() createHackatonDto: CreateHackatonDto, @Session() session: UserSession) {
    return this.hackatonService.create(createHackatonDto, session.user.id);
  }

  @Get()
  findAll() {
    return this.hackatonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hackatonService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHackatonDto: UpdateHackatonDto,
    @Session() session: UserSession,
  ) {
    return this.hackatonService.update(id, updateHackatonDto, session.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Session() session: UserSession) {
    return this.hackatonService.remove(id, session.user.id);
  }
}
