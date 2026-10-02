import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * gradeFoodPhoto — Chef Coach's eye.
 * A vendor uploads a menu or truck photo during onboarding; this returns a
 * 1–10 score, a one-line verdict in a friendly Houston voice, and up to three
 * concrete fixes (light, distance, background, angle, plating).
 *
 * Body: { image_url: string, kind?: 'food' | 'truck' | 'logo', item_name?: string }
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let body: { image_url?: string; kind?: string; item_name?: string } = {};
  try { body = await req.json(); } catch { /* fall through */ }
  const { image_url, kind = 'food', item_name = '' } = body;
  if (!image_url) return Response.json({ error: 'image_url is required' }, { status: 400 });

  const subject =
    kind === 'truck' ? 'a food truck exterior / banner photo'
    : kind === 'logo' ? 'a food truck logo'
    : `a menu photo${item_name ? ` of "${item_name}"` : ''}`;

  const prompt = `You are Chef Coach, the friendly photo coach inside CurbChef, a Houston food truck ordering app.
A vendor just uploaded ${subject}. Judge it ONLY on how well it will sell on a phone screen.

Score 1-10:
- 9-10: bright, sharp, food fills the frame, appetizing color, clean background
- 6-8: good, one or two easy fixes
- 1-5: too dark, blurry, too far away, cluttered background, or the subject isn't clear

Tips must be specific and doable on a phone in under a minute, e.g.
"Step into open shade, not direct noon sun", "Move closer so the brisket fills the frame",
"Shoot from a 45 degree angle so we see the bark", "Wipe the plate edge", "Clear the table behind it".
Never mention editing apps or buying gear. Speak like a supportive coach, short and warm, Houston casual but professional.
If the image is not food${kind === 'food' ? '' : ' or a truck/logo'} at all, set is_relevant=false.`;

  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [image_url],
      response_json_schema: {
        type: 'object',
        properties: {
          score: { type: 'number', description: '1-10' },
          verdict: { type: 'string', description: 'One short sentence, max 12 words' },
          tips: { type: 'array', items: { type: 'string' }, description: '0-3 specific fixes' },
          is_relevant: { type: 'boolean' },
        },
        required: ['score', 'verdict', 'tips', 'is_relevant'],
      },
    });
    const score = Math.max(1, Math.min(10, Math.round(Number(result?.score) || 0)));
    return Response.json({
      score,
      verdict: String(result?.verdict || '').slice(0, 140),
      tips: Array.isArray(result?.tips) ? result.tips.slice(0, 3).map(String) : [],
      is_relevant: result?.is_relevant !== false,
    });
  } catch (err) {
    console.error('gradeFoodPhoto failed', err);
    return Response.json({ error: 'Coach is busy, try again in a moment' }, { status: 502 });
  }
});
