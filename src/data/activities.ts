export interface Activity {
  id: string;
  name: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  safetyInfo: string;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'climbing-wall',
    name: 'INDOOR CLIMBING WALL',
    image:
      'https://images.pexels.com/photos/5384642/pexels-photo-5384642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Scale new heights on our indoor climbing wall designed for all skill levels.',
    fullDescription:
      'Challenge yourself on our indoor climbing wall, built for beginners and experienced climbers alike. Test your strength, focus, and determination as you ascend to the top. A thrilling vertical adventure that builds confidence and coordination.',
    safetyInfo:
      'Follow staff instructions and use required safety equipment at all times. Participants must be below 120 kg.',
  },
  {
    id: 'main-trampoline-court',
    name: 'MAIN TRAMPOLINE COURT',
    image:
      'https://images.pexels.com/photos/6571947/pexels-photo-6571947.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Jump, bounce, and fly across our expansive main trampoline court.',
    fullDescription:
      'Experience the pure joy of weightlessness on our main trampoline court. Bounce, flip, and soar through the air in a massive space designed for maximum fun. Perfect for kids, teens, and adults looking to defy gravity.',
    safetyInfo:
      'Follow staff instructions and activity-specific rules. One jumper per square at a time. Participants must be below 120 kg.',
  },
  {
    id: 'trampoline-basketball',
    name: 'TRAMPOLINE BASKETBALL',
    image:
      'https://images.pexels.com/photos/8693810/pexels-photo-8693810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Slam dunk like a pro with the added power of trampoline launches.',
    fullDescription:
      'Take your basketball game to new heights — literally. Use the trampoline runway to launch yourself for spectacular dunks and jaw-dropping shots. A fan favourite that combines athletic skill with pure adrenaline.',
    safetyInfo:
      'Follow staff instructions. Wait for the previous player to exit before starting your run. Participants must be below 120 kg.',
  },
  {
    id: 'sweeper',
    name: 'SWEEPER',
    image:
      'https://images.pexels.com/photos/1739321/pexels-photo-1739321.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Duck, jump, and dodge the spinning sweeper bar to stay in the game.',
    fullDescription:
      'Test your reflexes and agility on the Sweeper. A rotating bar sweeps across the platform and your job is to jump over or duck under it. Last one standing wins. It is fast, fun, and guaranteed to get your heart racing.',
    safetyInfo:
      'Follow staff instructions. Do not attempt moves beyond your ability. Participants must be below 120 kg.',
  },
  {
    id: 'hanging-tire-bridge',
    name: 'HANGING TIRE BRIDGE',
    image:
      'https://images.pexels.com/photos/15742483/pexels-photo-15742483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Navigate a bridge of suspended tires in this balance and grip challenge.',
    fullDescription:
      'Cross our hanging tire bridge by stepping from one suspended tire to the next. It takes balance, grip strength, and courage to make it across without touching the ground. A classic adventure challenge that rewards determination.',
    safetyInfo:
      'Follow staff instructions. Maintain grip at all times. Do not rush. Participants must be below 120 kg.',
  },
  {
    id: 'ninja-warrior-rings',
    name: 'NINJA WARRIOR RINGS',
    image:
      'https://images.pexels.com/photos/6390242/pexels-photo-6390242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Swing from ring to ring like a ninja warrior in this grip challenge.',
    fullDescription:
      'Channel your inner ninja as you swing from ring to ring across our Ninja Warrior course. It demands upper body strength, timing, and coordination. Make it to the other side and you will feel like a true warrior.',
    safetyInfo:
      'Follow staff instructions. Use required safety equipment. Do not skip rings. Participants must be below 120 kg.',
  },
  {
    id: 'foam-obstacles',
    name: 'FOAM OBSTACLES & CYLINDRICAL BLOCKS',
    image:
      'https://images.pexels.com/photos/6572608/pexels-photo-6572608.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Climb, crawl, and conquer our soft foam obstacle course.',
    fullDescription:
      'Navigate a colourful course of foam obstacles and cylindrical blocks. Climb over, crawl under, and push through each challenge. Designed for safe, energetic play that keeps everyone moving and laughing.',
    safetyInfo:
      'Follow staff instructions and activity-specific rules. Do not throw foam blocks. Participants must be below 120 kg.',
  },
  {
    id: 'foam-bridges',
    name: 'TRIANGLE & RECTANGLE FOAM BRIDGES',
    image:
      'https://images.pexels.com/photos/11244351/pexels-photo-11244351.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Balance and bound across geometric foam bridges in a fun challenge.',
    fullDescription:
      'Cross our triangle and rectangle foam bridges, stepping carefully from one shape to the next. Each bridge tests your balance and coordination in a different way. A playful challenge that is as fun to watch as it is to do.',
    safetyInfo:
      'Follow staff instructions. Cross one at a time. Do not push other participants. Participants must be below 120 kg.',
  },
  {
    id: 'jumping-balloons',
    name: 'JUMPING BALLOONS',
    image:
      'https://images.pexels.com/photos/296308/pexels-photo-296308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
    shortDescription:
      'Bounce and play in our colourful jumping balloon zone.',
    fullDescription:
      'Jump into a vibrant zone filled with colourful balloons for bouncing, playing, and letting loose. Perfect for younger visitors and anyone who loves pure, unstructured fun. A joyful experience that lights up every face.',
    safetyInfo:
      'Follow staff instructions. No rough play. Follow all park guidelines. Participants must be below 120 kg.',
  },
];

export const GALLERY_IMAGES = [
  'https://images.pexels.com/photos/6571947/pexels-photo-6571947.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/5384642/pexels-photo-5384642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/3763703/pexels-photo-3763703.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/8693810/pexels-photo-8693810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/6390242/pexels-photo-6390242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/296308/pexels-photo-296308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/1739321/pexels-photo-1739321.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/15742483/pexels-photo-15742483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/6572608/pexels-photo-6572608.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/11031912/pexels-photo-11031912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/11244351/pexels-photo-11244351.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
  'https://images.pexels.com/photos/1313818/pexels-photo-1313818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840',
];
