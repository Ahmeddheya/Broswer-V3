import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('check', () => {
    it('should return healthy status when database is connected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([]);

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
    });

    it('should return error status when database is disconnected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection failed'));

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('ready', () => {
    it('should return ready status', async () => {
      const result = await controller.ready();

      expect(result.status).toBe('ready');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('live', () => {
    it('should return alive status', async () => {
      const result = await controller.live();

      expect(result.status).toBe('alive');
      expect(result.timestamp).toBeDefined();
    });
  });
});