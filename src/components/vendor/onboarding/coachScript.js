/**
 * Chef Coach script — what the coach says at each onboarding step.
 * Every step answers three things: what we're doing, why it matters for
 * sales, and one pro tip. Lines can read the truck + menu so the coach
 * celebrates progress ("6 items loaded") instead of repeating itself.
 */
const firstName = truck => (truck?.owner_name || '').split(' ')[0];

export function coachLines(step, { truck, menuItems = [] }) {
  const name = firstName(truck);
  const truckName = truck?.name?.trim() || 'your truck';
  const withPhotos = menuItems.filter(i => i.image_url).length;

  switch (step) {
    case 1:
      return {
        lines: [
          `Welcome to CurbChef${name ? `, ${name}` : ''}. I'm Chef Coach. I'll walk you through setup, about 10 minutes total.`,
          `First: who you are. Eaters follow people, not logos, so tell them your story in a line or two.`,
        ],
        why: 'A line about who you are turns your page from a listing into a place people want to try.',
      };
    case 2:
      return {
        lines: [
          `Nice, ${truckName} is on the map. Now let's make it look as good as it tastes.`,
          `Upload your logo and a wide shot of the truck. I'll check each photo and tell you if it'll sell.`,
        ],
        why: 'Your banner is the first thing eaters see on your page. A bright, clear truck shot says "open and ready."',
        guide: true,
      };
    case 3:
      return {
        lines: [
          `Looking sharp. Next: where and when.`,
          `Set your spot and hours so the map and "Open now" show you to people nearby.`,
        ],
        why: 'Most orders come from people within a couple miles. If your hours are wrong, you disappear from "Open now."',
      };
    case 4:
      return {
        lines: menuItems.length
          ? [
              `${menuItems.length} item${menuItems.length === 1 ? '' : 's'} on the board${withPhotos ? `, ${withPhotos} with photos` : ''}. Let's make every one of them hit.`,
              `Add a photo and a mouth-watering line to each item. Tap "Write it for me" if you want a head start.`,
            ]
          : [
              `Time for the good part: your menu.`,
              `Start with your 3 best sellers. Give each one a photo and a description that makes people hungry.`,
            ],
        why: 'People order with their eyes. Your dishes also show up in Crave, where eaters swipe through food. No photo, no swipe.',
        guide: true,
      };
    case 5:
      return {
        lines: [
          `Menu's looking hungry. Let's make sure you get paid.`,
          `Connect Stripe and payouts land in your bank account. You keep 88% of every order.`,
        ],
        why: 'You can finish this later, but you can\'t take orders until Stripe is connected.',
      };
    case 6:
      return {
        lines: [
          `Almost there. A few extras that bring people to your window:`,
          `Live Clips (film 10 seconds of the cook) and Curb Drops (flash deals that ping nearby eaters).`,
        ],
        why: 'A 10-second clip proves you\'re real and cooking right now. It\'s free advertising at the top of the app.',
      };
    case 7:
      return {
        lines: [
          `That's a wrap. ${truckName} is ready for Houston.`,
          `Give it one last look, then hit launch.`,
        ],
        why: 'You can edit anything later from your vendor dashboard.',
      };
    default:
      return { lines: [] };
  }
}

export const PHOTO_RULES = [
  { title: 'Shade, not sun', body: 'Step into open shade or near a window. Direct noon sun makes harsh shadows and blown-out spots.' },
  { title: 'Get close', body: 'Fill the frame with the food. If you can see the table edge or your hand, move closer.' },
  { title: 'Find the angle', body: 'Burgers and sandwiches: eye level. Bowls, pizza, and plates: straight down. Brisket and tacos: 45 degrees.' },
  { title: 'Clean background', body: 'Clear napkins, bottles, and receipts out of the shot. A plain counter or board works best.' },
  { title: 'Show the good part', body: 'Bark on the brisket, cheese pull, the sauce. Turn the plate so the best side faces the camera.' },
  { title: 'Hold steady', body: 'Tap the screen to focus on the food, then hold still for a second. Blurry photos never sell.' },
];
