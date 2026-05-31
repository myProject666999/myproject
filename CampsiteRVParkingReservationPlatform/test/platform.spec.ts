import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfigService } from '../src/config/database.config';

import { UserModule } from '../src/modules/user/user.module';
import { UserService } from '../src/modules/user/user.service';
import { User } from '../src/modules/user/user.entity';

import { CampsiteModule } from '../src/modules/campsite/campsite.module';
import { CampsiteService } from '../src/modules/campsite/campsite.service';
import { Campsite } from '../src/modules/campsite/campsite.entity';

import { SpotModule } from '../src/modules/spot/spot.module';
import { SpotService } from '../src/modules/spot/spot.service';
import { Spot, SpotType } from '../src/modules/spot/spot.entity';

import { ReservationModule } from '../src/modules/reservation/reservation.module';
import { ReservationService } from '../src/modules/reservation/reservation.service';
import { Reservation } from '../src/modules/reservation/reservation.entity';

describe('Platform Core Tests', () => {
  let userService: UserService;
  let campsiteService: CampsiteService;
  let spotService: SpotService;
  let reservationService: ReservationService;
  let testUser: User;
  let testCampsite: Campsite;
  let testSpot: Spot;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
          useClass: DatabaseConfigService,
        }),
        TypeOrmModule.forFeature([User, Campsite, Spot, SpotType, Reservation]),
        UserModule,
        CampsiteModule,
        SpotModule,
        ReservationModule,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    campsiteService = module.get<CampsiteService>(CampsiteService);
    spotService = module.get<SpotService>(SpotService);
    reservationService = module.get<ReservationService>(ReservationService);
  });

  describe('User Module', () => {
    it('should create a user', async () => {
      const user = await userService.create({
        username: 'testuser_' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        phone: '138' + Date.now().toString().slice(-8),
        password: 'test123456',
        nickname: 'Test User',
      });
      testUser = user;
      expect(user).toBeDefined();
      expect(user.id).toBeGreaterThan(0);
      expect(user.username).toContain('testuser_');
    });

    it('should validate password', async () => {
      const isValid = await userService.validatePassword(testUser.username, 'test123456');
      expect(isValid).toBe(true);
    });
  });

  describe('Campsite Module', () => {
    it('should create a campsite', async () => {
      const campsite = await campsiteService.create({
        ownerId: testUser.id,
        name: '测试营地 ' + Date.now(),
        description: '这是一个测试营地',
        address: '北京市朝阳区测试路1号',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        latitude: 39.9042,
        longitude: 116.4074,
        facilities: ['洗手间', '淋浴', 'WiFi'],
        status: 1,
      });
      testCampsite = campsite;
      expect(campsite).toBeDefined();
      expect(campsite.id).toBeGreaterThan(0);
      expect(campsite.ownerId).toBe(testUser.id);
    });

    it('should find campsites with filters', async () => {
      const result = await campsiteService.findAll({
        city: '北京市',
        page: 1,
        pageSize: 10,
      });
      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(Array.isArray(result.list)).toBe(true);
    });
  });

  describe('Spot Module', () => {
    it('should create a spot', async () => {
      const spot = await spotService.create({
        campsiteId: testCampsite.id,
        typeId: 1,
        name: 'A001',
        description: '标准房车营位',
        area: 50,
        maxOccupancy: 4,
        maxVehicleLength: 12,
        hasElectricity: 1,
        hasWater: 1,
        hasSewage: 1,
        pricePerDay: 200,
        weekendPrice: 280,
        status: 1,
      });
      testSpot = spot;
      expect(spot).toBeDefined();
      expect(spot.id).toBeGreaterThan(0);
      expect(spot.campsiteId).toBe(testCampsite.id);
    });

    it('should get spot types', async () => {
      const types = await spotService.findAllSpotTypes();
      expect(types).toBeDefined();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });

    it('should check spot availability', async () => {
      const checkinDate = new Date();
      checkinDate.setDate(checkinDate.getDate() + 1);
      const checkoutDate = new Date();
      checkoutDate.setDate(checkoutDate.getDate() + 3);

      const isAvailable = await spotService.isSpotAvailable(
        testSpot.id,
        checkinDate,
        checkoutDate,
      );
      expect(isAvailable).toBe(true);
    });

    it('should find available spots', async () => {
      const checkinDate = new Date();
      checkinDate.setDate(checkinDate.getDate() + 1);
      const checkoutDate = new Date();
      checkoutDate.setDate(checkoutDate.getDate() + 3);

      const spots = await spotService.findAvailableSpots(
        testCampsite.id,
        checkinDate,
        checkoutDate,
      );
      expect(Array.isArray(spots)).toBe(true);
    });
  });

  describe('Reservation Module - Overlapping Prevention', () => {
    let testReservation: any;

    it('should create a reservation', async () => {
      const checkinDate = new Date();
      checkinDate.setDate(checkinDate.getDate() + 5);
      const checkoutDate = new Date();
      checkoutDate.setDate(checkoutDate.getDate() + 8);

      const reservation = await reservationService.create({
        userId: testUser.id,
        campsiteId: testCampsite.id,
        spotId: testSpot.id,
        checkinDate,
        checkoutDate,
        contactName: testUser.nickname,
        contactPhone: testUser.phone,
        guestCount: 2,
      });
      testReservation = reservation;
      expect(reservation).toBeDefined();
      expect(reservation.id).toBeGreaterThan(0);
      expect(reservation.reservationNo).toBeDefined();
      expect(reservation.status).toBe('pending');
      expect(reservation.days).toBe(3);
    });

    it('should prevent overlapping reservation', async () => {
      const checkinDate = new Date();
      checkinDate.setDate(checkinDate.getDate() + 6);
      const checkoutDate = new Date();
      checkoutDate.setDate(checkoutDate.getDate() + 7);

      await expect(
        reservationService.create({
          userId: testUser.id,
          campsiteId: testCampsite.id,
          spotId: testSpot.id,
          checkinDate,
          checkoutDate,
          contactName: testUser.nickname,
          contactPhone: testUser.phone,
          guestCount: 2,
        }),
      ).rejects.toThrow('Spot is not available');
    });

    it('should confirm reservation', async () => {
      const confirmed = await reservationService.confirm(testReservation.id);
      expect(confirmed.status).toBe('confirmed');
      expect(confirmed.paymentStatus).toBe('paid');
    });

    it('should get spot calendar', async () => {
      const month = new Date().toISOString().slice(0, 7);
      const calendar = await reservationService.getSpotCalendar(testSpot.id, month);
      expect(calendar).toBeDefined();
      expect(typeof calendar).toBe('object');
    });

    it('should calculate refund percentage correctly', () => {
      expect(reservationService.calculateRefundPercentage(10)).toBe(100);
      expect(reservationService.calculateRefundPercentage(5)).toBe(70);
      expect(reservationService.calculateRefundPercentage(2)).toBe(30);
      expect(reservationService.calculateRefundPercentage(0)).toBe(0);
    });
  });

  afterAll(async () => {
    console.log('All tests completed successfully!');
  });
});
