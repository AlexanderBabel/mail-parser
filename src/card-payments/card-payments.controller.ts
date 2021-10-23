import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { CardPaymentsApiService } from './services/card-payments-api.service';
import { PrismaService } from './services/prisma.service';

@Controller('payments')
export class CardPaymentsController {
  private readonly logger = new Logger(CardPaymentsController.name);

  private readonly CARD_PAYMENTS_SECRET = this.configService.get<string>(
    'CARD_PAYMENTS_SECRET',
  );

  constructor(
    private configService: ConfigService,
    private cardPaymentsApiService: CardPaymentsApiService,
    private prismaService: PrismaService,
  ) {}

  @Cron('5 0,2,12,18,22 * * *')
  async fetchNewPayments() {
    const lastPayment = await this.prismaService.payments.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const newPayments = lastPayment?.id
      ? await this.cardPaymentsApiService.getPayments({
          next: lastPayment.id,
          order: 'asc',
          count: 20,
        })
      : await this.cardPaymentsApiService.getPayments({ count: 20 });

    await this.prismaService.payments.createMany({ data: newPayments });
  }

  @Get()
  getPayments(@Query('secret') secret: string) {
    if (!secret || this.CARD_PAYMENTS_SECRET !== secret) {
      throw new UnauthorizedException();
    }

    return this.prismaService.payments.findMany({
      where: { completed: false },
      select: { id: true, amount: true, description: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Post('complete')
  complete(@Body('id') id: string, @Query('secret') secret: string) {
    if (!secret || this.CARD_PAYMENTS_SECRET !== secret) {
      throw new UnauthorizedException();
    }

    return this.prismaService.payments.update({
      where: { id },
      data: { completed: true, completedAt: new Date() },
    });
  }
}
