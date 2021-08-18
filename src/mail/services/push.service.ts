import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export type PushAttachment = {
  content: string;
  contentType: string;
  name?: string;
};

@Injectable()
export class PushService {
  private readonly httpClient: AxiosInstance;

  private readonly logger = new Logger(PushService.name);

  private readonly PUSH_ENDPOINT =
    this.configService.get<string>('PUSH_ENDPOINT');

  constructor(private configService: ConfigService) {
    if (!this.PUSH_ENDPOINT) {
      throw new Error('Missing env var! PUSH_ENDPOINT is not defined.');
    }

    this.httpClient = axios.create({
      method: 'post',
      timeout: 10_000,
      baseURL: this.PUSH_ENDPOINT,
    });
  }

  public async sendPush(
    roomId: string,
    message: string,
    attachment?: PushAttachment,
  ) {
    return this.httpClient?.request({
      data: {
        roomId,
        message,
        attachment,
      },
    });
  }
}
