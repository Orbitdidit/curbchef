import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { image_url } = await req.json();

  if (!image_url) {
    return Response.json({ error: 'image_url is required' }, { status: 400 });
  }

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a food nutrition expert and dietitian AI. Analyze the food in this image.

Return a detailed JSON with:
- food_name: name of the food detected (string)
- confidence: confidence percentage 0-100 (number)
- calories: estimated total calories (number)
- macros: { protein_g: number, carbs_g: number, fat_g: number, fiber_g: number }
- portion_size: estimated portion (string, e.g. "1 serving (~250g)")
- health_score: score from 1-10 (10 = very healthy) (number)
- health_notes: short notes on nutritional profile (string)
- healthier_alternatives: array of 3 healthier food suggestions (array of strings)
- cuisine_type: closest cuisine category from this list: tacos, burgers, bbq, seafood, asian, fusion, desserts, vegan, pizza, soul_food (string)

Be concise and practical. If you cannot detect food clearly, set confidence below 40 and food_name to "Unknown food".`,
    file_urls: [image_url],
    response_json_schema: {
      type: "object",
      properties: {
        food_name: { type: "string" },
        confidence: { type: "number" },
        calories: { type: "number" },
        macros: {
          type: "object",
          properties: {
            protein_g: { type: "number" },
            carbs_g: { type: "number" },
            fat_g: { type: "number" },
            fiber_g: { type: "number" }
          }
        },
        portion_size: { type: "string" },
        health_score: { type: "number" },
        health_notes: { type: "string" },
        healthier_alternatives: { type: "array", items: { type: "string" } },
        cuisine_type: { type: "string" }
      }
    }
  });

  return Response.json(result);
});