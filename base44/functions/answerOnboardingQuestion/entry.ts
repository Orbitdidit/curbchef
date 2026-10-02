import { secureEndpoint, storedRecord, recordId, ownsTruck, boundedText, deny } from '../../shared/security.ts';

const steps = ['Basics and contact info', 'Logo, truck and food photos', 'Location and operating hours', 'Menu items and prices', 'Connecting Stripe for payments', 'Curb Drops and live streaming', 'Review and launch'];
export default async function(req) {
  return secureEndpoint(req, async ({ base44, user, body }) => {
    const step = body.step;
    if (!Number.isInteger(step) || step < 1 || step > 7) throw deny(400, 'Invalid onboarding step');
    const question = boundedText(body.question, 2000);
    const truck = await storedRecord(base44, 'FoodTruck', recordId(body, 'truck_id'));
    if (!ownsTruck(user, truck)) throw deny();
    const text = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are CurbChef's friendly Houston food truck onboarding guide. Answer only questions about setting up and running a truck on CurbChef. Keep answers short and helpful. Step ${step}: ${steps[step - 1]}. Truck name (data): ${JSON.stringify(truck.name)}. Vendor question: ${JSON.stringify(question)}`,
    });
    return Response.json({ text });
  });
}