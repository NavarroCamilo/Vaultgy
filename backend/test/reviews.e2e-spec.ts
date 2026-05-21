import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ReviewService } from '../src/modules/review/review.service';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { RolesGuard } from '../src/guards/roles.guard';

describe('Reviews (e2e)', () => {
  let app: INestApplication;

  const created = { id: 'r1', rating: 8, comment: 'ok', userId: 'u1', gameId: 'g1' };
  const mockReviewService = {
    create: jest.fn().mockResolvedValue(created),
    findAllByGamePaged: jest.fn().mockResolvedValue({ data: [created], meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 } }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ReviewService)
      .useValue(mockReviewService)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /reviews (admin) creates review', async () => {
    const res = await request(app.getHttpServer())
      .post('/reviews')
      .send({ userId: 'u1', gameId: 'g1', rating: 8, comment: 'ok' })
      .expect(201 || 200);

    expect(res.body).toEqual(created);
  });

  it('GET /reviews/game/:gameId/paged returns paged reviews', async () => {
    const res = await request(app.getHttpServer()).get('/reviews/game/g1/paged').expect(200);
    expect(res.body.data[0]).toEqual(created);
  });
});
