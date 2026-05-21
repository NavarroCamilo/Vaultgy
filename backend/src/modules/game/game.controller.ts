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

import { UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  @ApiOperation({ summary: 'List all games' })
  findAll(@Query('take') take?: string) {
    const parsedTake = take === undefined ? undefined : Number.parseInt(take, 10);

    return this.gameService.findAll(
      Number.isNaN(parsedTake) ? undefined : parsedTake,
    );
  }

  @Get('paged')
  @ApiOperation({ summary: 'List games with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10, enum: [10, 25, 50] })
  findAllPaged(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.gameService.findAllPaged(page, pageSize);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search games by title or genre' })
  search(
    @Query('column') column: string,
    @Query('value') value: string,
  ) {
    return this.gameService.searchByColumn(column, value);
  }

  @Get('search/paged')
  @ApiOperation({ summary: 'Search games by title or genre with pagination' })
  @ApiQuery({ name: 'column', required: true, enum: ['title', 'genre'] })
  @ApiQuery({ name: 'value', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10, enum: [10, 25, 50] })
  searchPaged(
    @Query('column') column: string,
    @Query('value') value: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.gameService.searchPagedByColumn(column, value, page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a game by id' })
  findById(@Param('id') id: string) {
    return this.gameService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Create a game' })
  create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Update a game' })
  update(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gameService.update(id, updateGameDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiCookieAuth('auth_token')
  @ApiOperation({ summary: 'Delete a game' })
  delete(@Param('id') id: string) {
    return this.gameService.delete(id);
  }
}