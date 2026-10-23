// Retired one-time diagnostic.
Deno.serve(() => Response.json({ error: 'gone' }, { status: 410 }));
