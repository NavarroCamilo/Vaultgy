import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const mockUser = { id: 'u1', username: 'alice', email: 'a@e.com' };
  const mockAuthService = {
    login: jest.fn().mockResolvedValue({ token: 'tok', user: mockUser }),
    register: jest.fn().mockResolvedValue(mockUser),
    getProfile: jest.fn().mockImplementation((req) => req.user),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login sets cookie and returns user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@e.com', password: 'pass' })
      .expect(201 || 200);

    // cookie should be set by controller
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body).toEqual(mockUser);
  });

  it('GET /auth/profile returns current user (guard mocked)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(200);
    expect(res.body).toEqual(mockUser);
  });
});
