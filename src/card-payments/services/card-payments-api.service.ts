import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';

export type PushAttachment = {
  content: string;
  contentType: string;
  name?: string;
};

type Payment = {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
};

type Transaction = {
  id: string;
  nature: 'payment' | 'DT';
  description: string;
  amount: {
    currency: string;
    amount: string;
  };
  native_amount: {
    currency: string;
    amount: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
};

type Response = {
  transactions: Transaction[];
  ok: boolean;
  meta: {
    pagination: {
      total: number;
      next: {
        last_id: string;
        count: number;
        order: string;
      };
    };
  };
};

type Parameters = {
  count?: number;
  order?: 'desc' | 'asc';
  next?: string;
};

@Injectable()
export class CardPaymentsApiService {
  private readonly httpClient?: AxiosInstance;

  private readonly logger = new Logger(CardPaymentsApiService.name);

  private readonly CARD_PAYMENTS_ENDPOINT = this.configService.get<string>(
    'CARD_PAYMENTS_ENDPOINT',
  );

  private readonly CARD_PAYMENTS_TOKEN = this.configService.get<string>(
    'CARD_PAYMENTS_TOKEN',
  );

  private readonly CARD_PAYMENTS_USER_AGENT = this.configService.get<string>(
    'CARD_PAYMENTS_USER_AGENT',
  );

  constructor(private configService: ConfigService) {
    if (
      !this.CARD_PAYMENTS_ENDPOINT ||
      !this.CARD_PAYMENTS_TOKEN ||
      !this.CARD_PAYMENTS_USER_AGENT
    ) {
      this.logger.log(
        'Missing env var! CARD_PAYMENTS_ENDPOINT, CARD_PAYMENTS_TOKEN or CARD_PAYMENTS_USER_AGENT is not defined. Skipping module...',
      );
      return;
    }

    this.httpClient = axios.create({
      method: 'get',
      timeout: 10_000,
      headers: {
        Authorization: `Bearer ${this.CARD_PAYMENTS_TOKEN}`,
        'User-Agent': this.CARD_PAYMENTS_USER_AGENT,
      },
    });
  }

  public async getPayments({
    count = 10,
    order = 'desc',
    next,
  }: Parameters = {}): Promise<Payment[]> {
    const response = await this.httpClient
      ?.request<Response>({
        url: this.CARD_PAYMENTS_ENDPOINT,
        data: { count, order, last_id: next ? `mco_card/${next}` : undefined },
      })
      .catch((error: AxiosError) =>
        this.logger.error(`${error.message} - Next: mco_card/${next} - Data: ${error.response?.data}`),
      );
    if (!response?.data.ok) {
      return [];
    }

    return response.data.transactions
      .map((t) => ({
        id: t.id,
        amount: Number.parseFloat(t.native_amount.amount) * -1,
        description: t.description,
        createdAt: t.created_at,
      }))
      .filter((p) => p.description.startsWith('Crv') && p.amount > 0);
  }
}
