import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getBillingStatus(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        country: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionId: true,
        billingProvider: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Organization with ID "${tenantId}" not found.`);
    }

    return tenant;
  }

  async updateCountry(tenantId: string, country: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Organization with ID "${tenantId}" not found.`);
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { country: country.toUpperCase() },
      select: { country: true },
    });

    return {
      message: 'Organization country updated successfully.',
      country: updated.country,
    };
  }

  async createCheckoutSession(tenantId: string, plan: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Organization with ID "${tenantId}" not found.`);
    }

    const country = tenant.country || 'US';
    const randomId = Math.random().toString(36).substring(4, 10).toUpperCase();

    // Indian Region Router: Route exclusively to Razorpay
    if (country === 'IN') {
      const amountInPaise = plan === 'PRO' ? 399900 : 999900; // Rs 3,999 / Rs 9,999
      return {
        success: true,
        gateway: 'RAZORPAY',
        orderId: `order_rzp_mock_${randomId}`,
        amount: amountInPaise,
        currency: 'INR',
        key: 'rzp_test_mock_orvexakey123',
        notes: {
          tenantId,
          plan,
        },
      };
    }

    // International / Global Router: Route to Stripe (or alternative PayPal)
    const successUrl = `http://localhost:3000/settings?session_id=cs_stripe_mock_${randomId}&success=true&plan=${plan}`;
    
    // We provide both Stripe and PayPal options to support international scalability
    return {
      success: true,
      gateway: 'STRIPE',
      sessionId: `cs_stripe_mock_${randomId}`,
      url: successUrl,
      alternatives: [
        {
          gateway: 'PAYPAL',
          approvalUrl: `http://localhost:3000/settings?paypal_mock_agreement=pay_mock_${randomId}&success=true&plan=${plan}`,
        }
      ]
    };
  }

  async processMockWebhook(provider: string, payload: any) {
    const { tenantId, plan, status, transactionId } = payload;

    if (!tenantId || !plan) {
      throw new BadRequestException('Webhook payload must specify tenantId and target subscription plan.');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Organization matching webhook tenantId "${tenantId}" not found.`);
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionPlan: plan.toUpperCase(),
        subscriptionStatus: status || 'ACTIVE',
        subscriptionId: transactionId || `sub_mock_${Math.random().toString(36).substring(4, 12)}`,
        billingProvider: provider.toUpperCase(),
      },
    });

    return {
      success: true,
      message: 'Subscription updated via payment gateway webhook successfully.',
      plan: updated.subscriptionPlan,
      status: updated.subscriptionStatus,
      provider: updated.billingProvider,
    };
  }
}
