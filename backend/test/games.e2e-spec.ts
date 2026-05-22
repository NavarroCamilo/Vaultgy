import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GameService } from '../src/modules/game/game.service';

describe('Games (e2e)', () => {
  let app: INestApplication;

  const mockPaged = {
    data: [{ id: 'g1', title: 'T' }],
    meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
  };

  const mockGameService = {
    findAllPaged: jest.fn().mockResolvedValue(mockPaged),
    searchPagedByColumn: jest.fn().mockResolvedValue(mockPaged),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(GameService)
      .useValue(mockGameService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /games/paged returns paged games', async () => {
    const res = await request(app.getHttpServer())
      .get('/games/paged')
      .expect(200);
    expect(res.body).toEqual(mockPaged);
  });

  it('GET /games/search/paged returns paged search results', async () => {
    const res = await request(app.getHttpServer())
      .get('/games/search/paged')
      .query({ column: 'title', value: 'T', page: 1, pageSize: 10 })
      .expect(200);

    expect(res.body).toEqual(mockPaged);
  });
});
