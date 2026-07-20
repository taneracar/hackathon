import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HackatonService } from './hackaton.service';
import { CreateHackatonDto } from './dto/create-hackaton.dto';
import { UpdateHackatonDto } from './dto/update-hackaton.dto';

@Controller('hackaton')
export class HackatonController {
  constructor(private readonly hackatonService: HackatonService) {}

  @Post()
  create(@Body() createHackatonDto: CreateHackatonDto) {
    return this.hackatonService.create(createHackatonDto);
  }

  @Get()
  findAll() {
    return this.hackatonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hackatonService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHackatonDto: UpdateHackatonDto) {
    return this.hackatonService.update(+id, updateHackatonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hackatonService.remove(+id);
  }
}
