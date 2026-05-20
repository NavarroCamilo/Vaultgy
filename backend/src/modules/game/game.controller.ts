import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  findAll(@Query('take') take?: string) {
    const parsedTake = take === undefined ? undefined : Number.parseInt(take, 10);

    return this.gameService.findAll(
      Number.isNaN(parsedTake) ? undefined : parsedTake,
    );
  }

  @Get('paged')
  findAllPaged(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.gameService.findAllPaged(page, pageSize);
  }

  @Get('search')
  findByTitle(@Query('title') title: string) {
    return this.gameService.findByTitle(title);
  }

  @Get('search/:title')
  findByTitlePath(@Param('title') title: string) {
    return this.gameService.findByTitle(title);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.gameService.findById(id);
  }

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gameService.update(id, updateGameDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.gameService.delete(id);
  }
}