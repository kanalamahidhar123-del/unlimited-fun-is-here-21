export interface Activity {
  id: string;
  name: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  safetyInfo: string;
  category: 'Trampoline' | 'Adventure' | 'Kids Soft Play';
}

export const ACTIVITIES: Activity[] = [
  // --- TRAMPOLINE ARENAS ---
  {
    id: 'trampoline-basketball',
    name: 'TRAMPOLINE BASKETBALL SLAM DUNK',
    image: '/games/game_trampoline_basketball.jpg',
    shortDescription:
      'Launch from springy trampoline runway beds to execute high-flying slam dunks into regulation hoops.',
    fullDescription:
      'Take your basketball skills to gravity-defying heights! Use dedicated trampoline launch runways to soar into the air and pull off spectacular dunks and alley-oops under vibrant neon LED arena lighting.',
    safetyInfo:
      'Do not hang on the rim. One jumper per lane at a time. Maximum Weight: 80 KG.',
    category: 'Trampoline',
  },
  {
    id: 'main-trampoline-court',
    name: 'MAIN TRAMPOLINE COURT & FREE JUMP ARENA',
    image: '/games/game_main_trampoline_court.jpg',
    shortDescription:
      'Massive interconnected trampoline jumping courts with 45-degree angled rebound walls.',
    fullDescription:
      'Our flagship jumping arena features wall-to-wall interconnected trampoline beds, padded dividing runways, and 45-degree angled wall trampolines for high-energy wall runs, flips, and freestyle bouncing.',
    safetyInfo:
      'One jumper per trampoline square. Grip socks mandatory. Maximum Weight: 80 KG.',
    category: 'Trampoline',
  },
  {
    id: 'mega-arena-glow',
    name: 'UNLIMITED FUN MEGA GLOW ARENA',
    image: '/games/game_mega_arena_glow.jpg',
    shortDescription:
      'Experience the entire adventure park with concert-grade multi-color laser lighting and sound.',
    fullDescription:
      'Immerse yourself in Bhimavaram’s largest indoor adventure zone equipped with vibrant laser light shows, neon glow trusses, and heart-pumping sound for an unforgettable glow jump party experience.',
    safetyInfo:
      'Follow marshal instructions throughout the arena. Maximum Weight: 80 KG.',
    category: 'Trampoline',
  },

  // --- ADVENTURE & OBSTACLE CHALLENGES ---
  {
    id: 'spiderman-climbing-wall',
    name: 'SPIDER-MAN SUPERHERO CLIMBING WALL',
    image: '/games/game_spiderman_climbing_wall.jpg',
    shortDescription:
      'Scale exciting vertical routes on our Marvel Spider-Man themed climbing wall over cushioned landing mats.',
    fullDescription:
      'Unleash your inner superhero on our iconic Spider-Man climbing wall. Featuring textured multi-level holds across realistic 3D comic artwork, this wall lets kids and teens test grip strength, agility, and balance with complete safety.',
    safetyInfo:
      'One climber per section. Padded trampoline landing zone below. Maximum Weight: 80 KG.',
    category: 'Adventure',
  },
  {
    id: 'castle-climbing-wall',
    name: 'FAIRYTALE CASTLE CLIMBING WALL',
    image: '/games/game_castle_climbing_wall.jpg',
    shortDescription:
      'Climb magical enchanted castle routes with colorful ergonomic holds over trampoline jump beds.',
    fullDescription:
      'Embark on a fairytale climbing journey! Ascend along magical castle towers with graded handholds designed to build climbing confidence, upper body strength, and coordination for all ages.',
    safetyInfo:
      'One climber per lane. Follow safety marshal instructions. Maximum Weight: 80 KG.',
    category: 'Adventure',
  },
  {
    id: 'climbing-wall',
    name: 'INTERACTIVE KIDS CLIMBING WALL',
    image: '/games/game_climbing_wall.jpg',
    shortDescription:
      'Challenge your grip, agility, and balance on our illustrated rock climbing wall built over a soft landing zone.',
    fullDescription:
      'Challenge your strength, agility, and balance on our interactive climbing wall featuring ergonomic climbing grips, colorful cartoon adventure artwork, and thick safety padding below for maximum confidence and excitement.',
    safetyInfo:
      'One climber per lane. Follow safety guidelines. Maximum Weight: 80 KG.',
    category: 'Adventure',
  },
  {
    id: 'foam-pit-zorb',
    name: 'GIANT FOAM PIT & ROLLING BUBBLE ARENA',
    image: '/games/game_foam_pit_zorb.jpg',
    shortDescription:
      'Jump and roll through thousands of ultra-soft foam cubes with giant inflatable bubble balls.',
    fullDescription:
      'Dive into thousands of multi-colored foam cubes and roll with giant inflatable spheres under dynamic arena lighting. A safe, thrilling plunge zone that brings pure laughter and joy.',
    safetyInfo:
      'Never dive headfirst. Land on your back or buttocks. Exit the landing area promptly.',
    category: 'Adventure',
  },
  {
    id: 'ninja-warrior-rings',
    name: 'NINJA WARRIOR SUSPENDED RING TRAVERSE',
    image: '/games/game_ninja_rings_bridge.jpg',
    shortDescription:
      'Swing through suspended rings and ropes over the foam pit like an authentic ninja warrior.',
    fullDescription:
      'Test your upper body stamina, grip strength, and rhythm as you swing from ring to ring high above a deep foam pit. A championship obstacle that builds coordination and athletic skill.',
    safetyInfo:
      'One participant per obstacle. Soft foam pit underneath for safety.',
    category: 'Adventure',
  },
  {
    id: 'aerial-suspension-bridge',
    name: 'AERIAL SUSPENSION STEP & RING BRIDGE',
    image: '/games/game_aerial_suspension_bridge.jpg',
    shortDescription:
      'Traverse hanging suspension planks and triangular swing grips high above the foam pit.',
    fullDescription:
      'Test your balance and agility across multiple aerial suspension lanes! Cross swinging rectangular foot bridges and swing through gymnastic rings over an ultra-deep foam cube landing pit.',
    safetyInfo:
      'One participant per lane. Maintain firm grip on chain supports.',
    category: 'Adventure',
  },
  {
    id: 'rope-ladder-climb',
    name: 'DISC ROPE & LADDER ADVENTURE CLIMB',
    image: '/games/game_rope_ladder_climb.jpg',
    shortDescription:
      'Climb disc ropes and aerial wooden ladders suspended over the neon foam cube arena.',
    fullDescription:
      'Conquer our suspended disc ropes, rope ladders, and hanging wooden rungs under vibrant neon lighting. Perfect for testing agility, climbing technique, and aerial balance.',
    safetyInfo:
      'Maintain firm grip with both hands. Follow safety instructions.',
    category: 'Adventure',
  },
  {
    id: 'hanging-tire-bridge',
    name: 'ACROBATIC HANGING TIRE BRIDGE',
    image: '/games/game_hanging_tire_bridge.jpg',
    shortDescription:
      'Step and balance across colorful webbed tires suspended on chains over the foam zone.',
    fullDescription:
      'Cross the arena by stepping from one swinging suspended tire to the next. Demands concentration, steady footwork, and balance over an exciting aerial crossing.',
    safetyInfo:
      'Maintain two points of contact. Do not intentionally swing or shake the bridge.',
    category: 'Adventure',
  },

  // --- KIDS SOFT PLAY & MAZES ---
  {
    id: 'giant-ball-pool-slides',
    name: 'GIANT OCEAN BALL POOL & DUAL SLIDES',
    image: '/games/game_giant_ball_pool_slides.jpg',
    shortDescription:
      'Slide down dual-lane wave slides straight into a giant sea of purple and white soft play balls.',
    fullDescription:
      'Plunge into an expansive ocean of thousands of sanitized purple and white balls! Features twin racing slides, padded foam climbing steps, and interactive play elements for endless fun.',
    safetyInfo:
      'For children below 5 years or 2.5 feet. Remove sharp items before entering.',
    category: 'Kids Soft Play',
  },
  {
    id: '2tier-soft-play-maze',
    name: '2-TIER SOFT PLAY ADVENTURE MAZE',
    image: '/games/game_2tier_soft_play_maze.jpg',
    shortDescription:
      'Multi-level padded adventure jungle gym with obstacle tunnels, swings, and viewing nets.',
    fullDescription:
      'A multi-level enclosed adventure paradise! Little ones can climb soft stairs, crawl through themed tunnels, navigate cross-obstacles, and look out across the entire park through heavy-duty safety mesh.',
    safetyInfo:
      'Strictly for young kids. Socks mandatory. Maximum safety netting on all levels.',
    category: 'Kids Soft Play',
  },
  {
    id: 'toddler-soft-play',
    name: 'TODDLER CANDY PLAY ZONE & SOFT ARENA',
    image: '/games/game_toddler_soft_play.jpg',
    shortDescription:
      'Colorful candy-themed enclosed soft play structure with sensory slides, foam cubes, and mini obstacles.',
    fullDescription:
      'A whimsical sweet-treat wonderland built specifically for little adventurers under 5 years. Features soft foam climbing ramps, mini ball pits, candy archways, and ultra-padded safety netting.',
    safetyInfo:
      'Designed exclusively for children below 5 years or 2.5 feet. Parental supervision required.',
    category: 'Kids Soft Play',
  },
  {
    id: 'x-obstacle-tunnel',
    name: 'X-OBSTACLE SOFT PLAY CRAWL TUNNEL',
    image: '/games/game_x_obstacle_tunnel.jpg',
    shortDescription:
      'Navigate padded diagonal X-beam hurdles and colorful crawl-through tunnels.',
    fullDescription:
      'A fun sensory motor-skill challenge featuring padded diagonal X-cylinders and tunnel crawl passages designed to encourage active exploration, crawling, and balance in a safe environment.',
    safetyInfo:
      'Padded foam construction. Suitable for toddlers and young children.',
    category: 'Kids Soft Play',
  },
];

export const GALLERY_IMAGES = [
  '/games/game_arena_entrance_facade.jpg',
  '/games/game_mega_arena_glow.jpg',
  '/games/game_main_trampoline_court.jpg',
  '/games/game_trampoline_basketball.jpg',
  '/games/game_spiderman_climbing_wall.jpg',
  '/games/game_castle_climbing_wall.jpg',
  '/games/game_giant_ball_pool_slides.jpg',
  '/games/game_2tier_soft_play_maze.jpg',
  '/games/game_toddler_soft_play.jpg',
  '/games/game_x_obstacle_tunnel.jpg',
  '/games/game_climbing_wall.jpg',
  '/games/game_foam_pit_zorb.jpg',
  '/games/game_ninja_rings_bridge.jpg',
  '/games/game_aerial_suspension_bridge.jpg',
  '/games/game_rope_ladder_climb.jpg',
  '/games/game_hanging_tire_bridge.jpg',
  '/games/game_night_entry_pathway.jpg',
];
