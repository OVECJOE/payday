import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private webhookService: WebhookService) {}

  @Public()
  @Post('paystack')
  @HttpCode(HttpStatus.OK)
  async handlePaystackWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ): Promise<{ message: string }> {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }

    this.logger.log('Received Paystack webhook');

    try {
      await this.webhookService.handlePaystackWebhook(payload, signature);
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error('Error processing Paystack webhook', error);
      throw error;
    }
  }

  //   @Public()
  //   @Post('flutterwave')
  //   @HttpCode(HttpStatus.OK)
  //   async handleFlutterwaveWebhook(
  //     @Body() payload: any,
  //     @Headers('verif-hash') signature: string,
  //   ): Promise<{ message: string }> {
  //     if (!signature) {
  //       throw new BadRequestException('Missing signature');
  //     }

  //     this.logger.log('Received Flutterwave webhook');

  //     try {
  //       await this.webhookService.handleFlutterwaveWebhook(payload, signature);
  //       return { message: 'Webhook processed successfully' };
  //     } catch (error) {
  //       this.logger.error('Error processing Flutterwave webhook', error);
  //       throw error;
  //     }
  //   }
}
