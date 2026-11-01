export const BANTER_LINES = {
  topBins: [
    "That smells like...PROMOTION",
    "Call the museum, that belongs in an exhibition.",
    "Cristiano, is that you?!",
    "Pulled straight from the absolute Mariana Trench of ball knowledge.",
    "Even the opposition fans are on their feet clapping.",
    "Ankara Messi-esque."
  ],
  worldie: [
    "Absolute thunderbolt! Take a bow.",
    "Ball knowledge is officially certified elite.",
    "Prime Adel Taarabt at Loftus Road territory.",
    "Upper ninety from 35 yards out. Keeper had no chance.",
    "He's got a foot like a traction engine! 🚂"
  ],
  hollywoodBall: [
    "Lobbing a Bruno grenade into the box and praying.",
    "A 50-yard crossfield ping just to show off for the cameras.",
    "The streets are starting to remember this name.",
    "Steven Gerrard crossfield diagonal on a rainy Tuesday.",
    "Diagonal perfection right on a sixpence! 📐"
  ],
  throughBall: [
    "Safe pass into feet. Sensible, tidy football.",
    "Respectable pick, but your nan definitely knew that one.",
    "Moving the chains. Nothing flashy, gets the job done.",
    "The midfield engine room special.",
    "Controlling the temperature like Pedri."
  ],
  tapIn: [
    "The Rodrizontal pass special — zero risk, zero progression.",
    "Stat-padding at its finest. Goal line bundle.",
    "We mustn't forget that its been rainin",
    "Did you even have to think for half a second?",
    "Is it the pink boots?",
    "THERE IS NO PASSION! THERE IS NO VISION! THERE IS NO AGGRESSION!"
  ],
  groan: [
    "Tried a no-look trivela... sent it straight into the car park.",
    "Nominated for the balon don't",
    "Oh my goodness Valentine.",
    "Leave the football, before the football leaves you.",
    "Absolute disasterclass! The manager is writing his resignation. 📝",
    "Sunday league stuff that. Straight into Row Z! 💺"
  ],
  timeout: [
    "Keeper panicked, froze on the ball, and conceded possession.",
    "Referee blew the whistle while you were still loading.",
    "Caught in two minds and lost the ball completely.",
    "Did your controller disconnect? 🎮",
    "Frozen like a deer in headlights! 🦌",
    "Time waster."
  ]
};

export const TIERS = {
  TAP_IN: { name: 'TAP-IN', color: '#9ca3af', min: 1, max: 20 },
  THROUGH_BALL: { name: 'THROUGH BALL', color: '#38bdf8', min: 21, max: 40 },
  HOLLYWOOD_BALL: { name: 'HOLLYWOOD BALL', color: '#ef4444', min: 41, max: 60 },
  WORLDIE: { name: 'WORLDIE', color: '#a855f7', min: 61, max: 80 },
  TOP_BINS: { name: 'TOP BINS', color: '#eab308', min: 81, max: 100 },
};

export function getTierForMeters(meters) {
  if (meters >= 81) return { key: 'topBins', ...TIERS.TOP_BINS };
  if (meters >= 61) return { key: 'worldie', ...TIERS.WORLDIE };
  if (meters >= 41) return { key: 'hollywoodBall', ...TIERS.HOLLYWOOD_BALL };
  if (meters >= 21) return { key: 'throughBall', ...TIERS.THROUGH_BALL };
  return { key: 'tapIn', ...TIERS.TAP_IN };
}