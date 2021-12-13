import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

export type PushAttachment = {
  content: string;
  contentType: string;
  name?: string;
};

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  private readonly PUSH_ENDPOINT =
    this.configService.get<string>('PUSH_ENDPOINT');

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  public async sendPush(
    roomId: string,
    message: string,
    attachment?: PushAttachment,
  ): Promise<Observable<AxiosResponse<{ success: boolean }>>> {
    if (!this.PUSH_ENDPOINT) {
      throw new Error('Missing env var! PUSH_ENDPOINT is not defined.');
    }

    return this.httpService.request<{ success: boolean }>({
      baseURL: this.PUSH_ENDPOINT,
      data: {
        roomId,
        message,
        attachment,
      },
    });
  }
}
