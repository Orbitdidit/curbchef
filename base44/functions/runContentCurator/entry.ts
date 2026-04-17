import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Triggers the content_curator agent to analyze LiveClipVideos
 * and promote trending content to HomepageConfig.
 * Can be called by the scheduler (no user) or by an admin.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow scheduler (no session) or admin users only
  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    // No user session = scheduler call — allowed
  }

  // Create a one-shot agent conversation to run curation
  const conversation = await base44.asServiceRole.functions.invoke('agentRun', {
    agent_name: 'content_curator',
    message: 'Please analyze all active LiveClipVideo uploads now and update the HomepageConfig to feature the best trending food content. Report what you changed.',
  });

  return Response.json({ success: true, result: conversation });
});