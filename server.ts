import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache timestamp to prevent repeated 429 quota exhaustion errors
let globalImageQuotaExhaustedUntil: number = 0;

// Art Style guidelines for prompt engineering
const STYLE_PROMPT_MODIFIERS: Record<string, string> = {
  'toddler-chunky': 'Extra thick 10px bold black solid outlines, huge simple friendly geometric shapes, zero small clutter, very large easy coloring areas, toddler cartoon coloring book style',
  'storybook': 'Classic whimsical storybook illustration, clean crisp black line art, charming fairytale character details, decorative leafy floral borders, friendly expressions',
  'kawaii': 'Japanese kawaii chibi doodle style, super cute rounded chibi characters with big sparkly eyes, floating sweets, smiling stars, tiny hearts, bubble tea cups, adorable thick line art',
  'mandala': 'Intricate decorative fantasy line art with subtle geometric mandala patterns inside wings, clouds, and floral borders, adult and older kid printable coloring page style',
  'comic': 'Dynamic adventure comic book line art, action angles, bold speed lines, heroic poses, stylized clouds, sound effect starburst banners, clean unfilled coloring page',
  'wildlife': 'Nature and safari explorer style, realistic yet friendly animal silhouettes, lush jungle leaves, botanical flowers, river pebbles, clean black contour line art'
};

// -------------------------------------------------------------
// DIVERSE MULTI-SCENE VECTOR COLORING LINE-ART ENGINE
// (Ensures each page is a completely distinct, high-quality, printable composition)
// -------------------------------------------------------------
function generateThematicColoringSvg(title: string, theme: string, pageNum: number, artStyle: string = 'storybook'): string {
  const escapes = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeTitle = escapes(title);
  const safeTheme = escapes(theme);

  // Frame and Header
  const outerFrame = `
    <rect width="600" height="800" fill="#ffffff" stroke="#000000" stroke-width="8" rx="16" />
    <rect x="22" y="22" width="556" height="756" fill="none" stroke="#000000" stroke-width="4" rx="10" />
    <!-- Header Banner -->
    <path d="M 50 65 Q 300 45 550 65 L 550 115 Q 300 95 50 115 Z" fill="#ffffff" stroke="#000000" stroke-width="4"/>
    <text x="300" y="98" font-family="'Fredoka', 'Arial', sans-serif" font-weight="900" font-size="20" text-anchor="middle" fill="#000000" letter-spacing="1.5">${safeTitle.toUpperCase()}</text>
    <!-- Footer Page Number -->
    <circle cx="300" cy="742" r="18" fill="#ffffff" stroke="#000000" stroke-width="3"/>
    <text x="300" y="748" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle" fill="#000000">${pageNum}</text>
  `;

  let sceneArtwork = '';

  // SCENE 1: Rocket Launch & Planetary Space Odyssey
  if (pageNum === 1 || theme.toLowerCase().includes('space') && pageNum === 1) {
    sceneArtwork = `
      <!-- Space Launch Scene -->
      <g stroke="#000000" stroke-width="5" fill="#ffffff">
        <!-- Giant Crescent Moon with craters -->
        <path d="M 460 160 A 70 70 0 1 0 490 280 A 55 55 0 0 1 460 160 Z" stroke-width="5"/>
        <circle cx="430" cy="230" r="12" stroke-width="4"/>
        <circle cx="455" cy="265" r="8" stroke-width="4"/>
        
        <!-- Center Big Cartoon Rocket Ship -->
        <g transform="translate(180, 150) rotate(-15 120 220)">
          <!-- Rocket Body -->
          <path d="M 120 40 Q 180 120 180 280 L 60 280 Q 60 120 120 40 Z" stroke-width="7"/>
          <!-- Rocket Nose Cone Pattern -->
          <path d="M 90 100 Q 120 115 150 100" fill="none" stroke-width="5"/>
          <!-- Porch Window with Friendly Smiling Alien Inside -->
          <circle cx="120" cy="180" r="38" stroke-width="6"/>
          <circle cx="120" cy="180" r="28" stroke-width="4"/>
          <!-- Alien face -->
          <circle cx="110" cy="175" r="5" fill="#000000"/>
          <circle cx="130" cy="175" r="5" fill="#000000"/>
          <path d="M 112 192 Q 120 200 128 192" fill="none" stroke-width="3"/>
          <path d="M 120 152 L 120 142" stroke-width="3"/>
          <circle cx="120" cy="140" r="3"/>
          <!-- Fins -->
          <path d="M 60 250 L 15 320 L 65 310 Z" stroke-width="6"/>
          <path d="M 180 250 L 225 320 L 175 310 Z" stroke-width="6"/>
          <path d="M 100 280 L 120 330 L 140 280 Z" stroke-width="5"/>
          <!-- Blast Flames -->
          <path d="M 70 320 Q 90 400 120 440 Q 150 400 170 320 Q 140 350 120 330 Q 100 350 70 320 Z" stroke-width="6"/>
          <path d="M 90 335 Q 120 400 150 335" fill="none" stroke-width="4"/>
        </g>

        <!-- Floating Saturn Planet -->
        <ellipse cx="120" cy="240" rx="45" ry="35" stroke-width="5"/>
        <path d="M 50 240 Q 120 290 190 240 Q 120 200 50 240" fill="none" stroke-width="6"/>

        <!-- Whimsical Stars & Sparkles -->
        <polygon points="100,380 110,405 135,405 115,420 122,445 100,430 78,445 85,420 65,405 90,405" stroke-width="4"/>
        <polygon points="480,380 490,400 512,400 495,413 502,434 480,422 458,434 465,413 448,400 470,400" stroke-width="4"/>
        <polygon points="320,130 326,145 342,145 330,155 335,170 320,161 305,170 310,155 298,145 314,145" stroke-width="3"/>
        
        <!-- Puffy Cloud Nebula Base for coloring -->
        <path d="M 30 670 Q 100 620 180 640 Q 250 590 340 620 Q 420 580 500 620 Q 570 650 570 710 L 30 710 Z" stroke-width="5"/>
        <circle cx="100" cy="670" r="15" stroke-dasharray="4,4" stroke-width="3"/>
        <circle cx="280" cy="650" r="20" stroke-dasharray="4,4" stroke-width="3"/>
        <circle cx="480" cy="660" r="18" stroke-dasharray="4,4" stroke-width="3"/>
      </g>
    `;
  }
  // SCENE 2: The Cute Astronaut T-Rex Explorer on Moon
  else if (pageNum === 2) {
    sceneArtwork = `
      <!-- Space Dinosaur on Moon Surface -->
      <g stroke="#000000" stroke-width="5" fill="#ffffff">
        <!-- Lunar Craters Ground -->
        <path d="M 30 600 Q 200 560 360 590 Q 480 580 570 610 L 570 720 L 30 720 Z" stroke-width="6"/>
        <ellipse cx="140" cy="640" rx="50" ry="18" stroke-width="4"/>
        <ellipse cx="440" cy="635" rx="60" ry="20" stroke-width="4"/>
        <ellipse cx="290" cy="660" rx="35" ry="12" stroke-width="4"/>

        <!-- Friendly T-Rex Character in Astronaut Suit -->
        <g transform="translate(140, 160)">
          <!-- Giant Bubble Helmet -->
          <circle cx="160" cy="150" r="95" stroke-width="8"/>
          <!-- Helmet Glass Reflection Arc -->
          <path d="M 100 110 A 80 80 0 0 1 200 90" fill="none" stroke-width="5" stroke-linecap="round"/>
          
          <!-- Cute Dino Head inside helmet -->
          <!-- Snout -->
          <path d="M 120 150 Q 70 150 70 180 Q 70 210 130 210 L 190 210 Q 220 210 220 160 Q 220 120 160 120 Z" stroke-width="6"/>
          <!-- Nostril -->
          <circle cx="95" cy="170" r="4" fill="#000000"/>
          <!-- Cute Big Eye with Star reflection -->
          <circle cx="165" cy="150" r="18" stroke-width="5"/>
          <circle cx="170" cy="146" r="6" fill="#000000"/>
          <!-- Friendly Teeth -->
          <polygon points="100,210 108,198 116,210" stroke-width="3"/>
          <polygon points="120,210 128,198 136,210" stroke-width="3"/>
          <polygon points="140,210 148,198 156,210" stroke-width="3"/>

          <!-- Spacesuit Body -->
          <path d="M 120 240 Q 80 320 100 400 L 220 400 Q 240 320 200 240 Z" stroke-width="7"/>
          <!-- Suit Control Chest Plate -->
          <rect x="130" y="270" width="60" height="45" rx="8" stroke-width="4"/>
          <circle cx="145" cy="292" r="6" stroke-width="3"/>
          <circle cx="175" cy="292" r="6" stroke-width="3"/>
          <!-- Little Cute Dino Arms in Space Gloves -->
          <path d="M 110 270 Q 70 280 60 300 Q 70 315 95 305" stroke-width="6" stroke-linecap="round"/>
          <path d="M 210 270 Q 250 280 260 300 Q 250 315 225 305" stroke-width="6" stroke-linecap="round"/>
          <!-- Big Tail with Dino Spikes -->
          <path d="M 210 380 Q 310 360 340 300 Q 320 370 215 415 Z" stroke-width="6"/>
          <polygon points="260,350 280,330 285,360" stroke-width="4"/>
          <polygon points="295,335 315,315 320,345" stroke-width="4"/>
          <!-- Chunky Moon Boots -->
          <path d="M 95 400 L 80 435 L 140 435 L 140 400 Z" stroke-width="6"/>
          <path d="M 180 400 L 180 435 L 240 435 L 225 400 Z" stroke-width="6"/>

          <!-- Astronaut Flag Pole held in hand -->
          <line x1="60" y1="210" x2="60" y2="435" stroke-width="5"/>
          <path d="M 60 210 L 0 230 L 60 250 Z" stroke-width="5"/>
          <circle cx="60" cy="205" r="6" stroke-width="4"/>
        </g>

        <!-- Distant Earth in Sky -->
        <circle cx="100" cy="200" r="40" stroke-width="5"/>
        <path d="M 75 190 Q 95 180 110 200 Q 130 190 120 220" fill="none" stroke-width="4"/>
        <!-- Star constellations -->
        <polygon points="490,180 495,195 510,195 498,205 502,220 490,210 478,220 482,205 470,195 485,195" stroke-width="3"/>
        <polygon points="380,240 384,252 396,252 386,260 390,272 380,264 370,272 374,260 364,252 376,252" stroke-width="3"/>
      </g>
    `;
  }
  // SCENE 3: Underwater Marine & Submarine Adventure
  else if (pageNum === 3 || theme.toLowerCase().includes('ocean') || theme.toLowerCase().includes('sea') || theme.toLowerCase().includes('water')) {
    sceneArtwork = `
      <!-- Deep Sea Exploration Scene -->
      <g stroke="#000000" stroke-width="5" fill="#ffffff">
        <!-- Ocean Floor with Corals and Seaweed -->
        <path d="M 30 670 Q 150 630 300 660 Q 450 620 570 670 L 570 720 L 30 720 Z" stroke-width="6"/>
        <!-- Seaweed ribbons -->
        <path d="M 60 670 Q 40 580 80 500 Q 40 430 70 360" fill="none" stroke-width="6" stroke-linecap="round"/>
        <path d="M 85 670 Q 110 590 85 520 Q 120 450 95 380" fill="none" stroke-width="5" stroke-linecap="round"/>
        <path d="M 500 670 Q 530 570 480 480 Q 530 400 500 320" fill="none" stroke-width="6" stroke-linecap="round"/>
        <path d="M 530 670 Q 550 600 525 530 Q 560 460 540 390" fill="none" stroke-width="5" stroke-linecap="round"/>

        <!-- Sea Shell & Starfish on sand -->
        <path d="M 220 670 C 220 650 250 640 260 660 C 270 640 300 650 300 670 Z" stroke-width="4"/>
        <polygon points="140,650 148,665 165,665 152,675 156,690 140,682 124,690 128,675 115,665 132,665" stroke-width="4"/>

        <!-- Submarine Explorer -->
        <g transform="translate(180, 180)">
          <!-- Submarine Hull -->
          <ellipse cx="140" cy="180" rx="130" ry="80" stroke-width="7"/>
          <!-- Periscope Tower -->
          <rect x="115" y="60" width="50" height="45" rx="6" stroke-width="5"/>
          <path d="M 130 60 L 130 20 L 170 20 L 170 35 L 145 35 L 145 60 Z" stroke-width="5"/>
          <!-- Big Round Porthole Windows -->
          <circle cx="80" cy="180" r="30" stroke-width="5"/>
          <circle cx="80" cy="180" r="22" stroke-width="3"/>
          <circle cx="150" cy="180" r="30" stroke-width="5"/>
          <circle cx="150" cy="180" r="22" stroke-width="3"/>
          <!-- Propeller Motor at Back -->
          <path d="M 10 180 L -15 150 L -10 180 L -15 210 Z" stroke-width="5"/>
          <ellipse cx="10" cy="180" rx="8" ry="18" stroke-width="4"/>
          <!-- Front Searchlight Beam -->
          <path d="M 265 160 L 370 120 L 370 240 L 265 200 Z" stroke-width="4" stroke-dasharray="8,6"/>
        </g>

        <!-- Friendly Smiling Octopus Companion -->
        <g transform="translate(70, 340)">
          <path d="M 40 80 C 40 10 140 10 140 80 C 140 110 120 120 90 120 C 60 120 40 110 40 80 Z" stroke-width="6"/>
          <!-- Cute Eyes with shine -->
          <circle cx="70" cy="70" r="12" stroke-width="4"/>
          <circle cx="72" cy="68" r="4" fill="#000000"/>
          <circle cx="110" cy="70" r="12" stroke-width="4"/>
          <circle cx="112" cy="68" r="4" fill="#000000"/>
          <path d="M 80 90 Q 90 102 100 90" fill="none" stroke-width="4" stroke-linecap="round"/>
          <!-- Curly Tentacles with suction cups -->
          <path d="M 50 115 Q 20 150 40 180 Q 60 170 55 140" fill="none" stroke-width="5"/>
          <path d="M 75 120 Q 65 170 90 190 Q 100 170 85 140" fill="none" stroke-width="5"/>
          <path d="M 105 120 Q 120 170 100 190 Q 90 170 105 140" fill="none" stroke-width="5"/>
          <path d="M 130 115 Q 160 150 140 180 Q 120 170 125 140" fill="none" stroke-width="5"/>
        </g>

        <!-- Floating Bubbles for coloring -->
        <circle cx="240" cy="150" r="16" stroke-width="4"/>
        <circle cx="230" cy="120" r="10" stroke-width="3"/>
        <circle cx="255" cy="100" r="7" stroke-width="3"/>
        <circle cx="480" cy="280" r="20" stroke-width="4"/>
        <circle cx="510" cy="240" r="12" stroke-width="3"/>
      </g>
    `;
  }
  // SCENE 4: Enchanted Castle, Baby Dragon & Fairytale Sky
  else if (pageNum === 4 || theme.toLowerCase().includes('dragon') || theme.toLowerCase().includes('castle') || theme.toLowerCase().includes('fairy')) {
    sceneArtwork = `
      <!-- Enchanted Castle and Friendly Dragon -->
      <g stroke="#000000" stroke-width="5" fill="#ffffff">
        <!-- Rolling Grassy Hills Base -->
        <path d="M 30 630 Q 180 570 330 610 Q 470 580 570 630 L 570 720 L 30 720 Z" stroke-width="6"/>
        <!-- River with stepping stones -->
        <path d="M 260 720 Q 300 660 270 610" fill="none" stroke-width="5"/>
        <path d="M 330 720 Q 360 660 310 610" fill="none" stroke-width="5"/>
        <ellipse cx="290" cy="670" rx="12" ry="6" stroke-width="3"/>
        <ellipse cx="320" cy="640" rx="10" ry="5" stroke-width="3"/>

        <!-- Fairytale Castle -->
        <g transform="translate(190, 310)">
          <!-- Main Castle Wall -->
          <rect x="40" y="100" width="140" height="120" stroke-width="6"/>
          <!-- Castle Wall Battlement Teeth -->
          <rect x="40" y="80" width="25" height="20" stroke-width="5"/>
          <rect x="78" y="80" width="25" height="20" stroke-width="5"/>
          <rect x="116" y="80" width="25" height="20" stroke-width="5"/>
          <rect x="155" y="80" width="25" height="20" stroke-width="5"/>
          <!-- Arched Gate with wooden planks -->
          <path d="M 85 220 L 85 155 Q 110 135 135 155 L 135 220 Z" stroke-width="5"/>
          <line x1="110" y1="140" x2="110" y2="220" stroke-width="3"/>
          <!-- Left Tower with Pointy Roof -->
          <rect x="10" y="40" width="45" height="180" stroke-width="6"/>
          <polygon points="5,40 32,-30 60,40" stroke-width="6"/>
          <line x1="32" y1="-30" x2="32" y2="-55" stroke-width="4"/>
          <polygon points="32,-55 55,-45 32,-35" stroke-width="3"/>
          <!-- Right Tower with Pointy Roof -->
          <rect x="165" y="40" width="45" height="180" stroke-width="6"/>
          <polygon points="160,40 187,-30 215,40" stroke-width="6"/>
          <line x1="187" y1="-30" x2="187" y2="-55" stroke-width="4"/>
          <polygon points="187,-55 210,-45 187,-35" stroke-width="3"/>
        </g>

        <!-- Cute Flying Baby Dragon with Wings -->
        <g transform="translate(120, 140)">
          <!-- Dragon Body -->
          <ellipse cx="140" cy="110" rx="60" ry="40" stroke-width="6"/>
          <!-- Dragon Head with Horns -->
          <path d="M 80 100 Q 30 70 50 40 Q 90 20 110 70 Z" stroke-width="6"/>
          <polygon points="90,30 95,5 105,35" stroke-width="4"/>
          <polygon points="105,35 115,10 120,45" stroke-width="4"/>
          <!-- Cute Eye -->
          <circle cx="70" cy="55" r="9" stroke-width="3"/>
          <circle cx="72" cy="53" r="3" fill="#000000"/>
          <!-- Happy Smile with tiny puff of smoke -->
          <path d="M 45 65 Q 55 75 65 65" fill="none" stroke-width="3"/>
          <circle cx="30" cy="55" r="6" stroke-width="2"/>
          <circle cx="20" cy="45" r="8" stroke-width="2"/>
          <!-- Flapping Wings with scallops -->
          <path d="M 120 85 Q 160 -10 220 30 Q 190 70 170 85 Q 150 95 120 85 Z" stroke-width="6"/>
          <path d="M 150 40 Q 170 15 195 35" fill="none" stroke-width="3"/>
          <!-- Curly Dragon Tail with heart tip -->
          <path d="M 195 125 Q 260 145 280 100" fill="none" stroke-width="6" stroke-linecap="round"/>
          <path d="M 280 100 C 275 85 295 85 295 95 C 295 85 315 85 310 100 C 300 115 285 120 280 100 Z" stroke-width="4"/>
        </g>

        <!-- Rainbow Bridge Arc & Sun -->
        <path d="M 360 260 A 140 140 0 0 1 540 260" fill="none" stroke-width="5"/>
        <path d="M 375 260 A 125 125 0 0 1 525 260" fill="none" stroke-width="5"/>
        <path d="M 390 260 A 110 110 0 0 1 510 260" fill="none" stroke-width="5"/>
        <!-- Smiling Sun -->
        <circle cx="500" cy="140" r="35" stroke-width="5"/>
        <circle cx="490" cy="135" r="5" fill="#000000"/>
        <circle cx="510" cy="135" r="5" fill="#000000"/>
        <path d="M 492 150 Q 500 158 508 150" fill="none" stroke-width="3"/>
        <line x1="500" y1="95" x2="500" y2="80" stroke-width="4"/>
        <line x1="540" y1="115" x2="555" y2="105" stroke-width="4"/>
        <line x1="460" y1="115" x2="445" y2="105" stroke-width="4"/>
      </g>
    `;
  }
  // SCENE 5: Grand Finale Picnic Party & Star Celebration
  else {
    sceneArtwork = `
      <!-- Grand Finale Celebration Party -->
      <g stroke="#000000" stroke-width="5" fill="#ffffff">
        <!-- Party Ground Grass -->
        <path d="M 30 620 Q 200 570 350 600 Q 480 570 570 620 L 570 720 L 30 720 Z" stroke-width="6"/>
        
        <!-- Overhead Party Pennant Bunting Banners -->
        <path d="M 30 150 Q 300 230 570 150" fill="none" stroke-width="5"/>
        <polygon points="70,165 95,225 120,175" stroke-width="4"/>
        <polygon points="140,180 165,240 190,190" stroke-width="4"/>
        <polygon points="210,195 235,255 260,202" stroke-width="4"/>
        <polygon points="280,205 305,265 330,205" stroke-width="4"/>
        <polygon points="350,202 375,255 400,195" stroke-width="4"/>
        <polygon points="420,190 445,240 470,180" stroke-width="4"/>
        <polygon points="490,175 515,225 540,165" stroke-width="4"/>

        <!-- Center 3-Tier Celebration Cake -->
        <g transform="translate(200, 370)">
          <!-- Bottom Tier -->
          <rect x="20" y="160" width="160" height="70" rx="8" stroke-width="6"/>
          <path d="M 20 180 Q 40 195 60 180 Q 80 195 100 180 Q 120 195 140 180 Q 160 195 180 180" fill="none" stroke-width="4"/>
          <!-- Middle Tier -->
          <rect x="45" y="100" width="110" height="60" rx="6" stroke-width="6"/>
          <path d="M 45 120 Q 72 135 100 120 Q 127 135 155 120" fill="none" stroke-width="4"/>
          <!-- Top Tier -->
          <rect x="70" y="50" width="60" height="50" rx="4" stroke-width="5"/>
          <!-- Candle with Flame -->
          <rect x="95" y="20" width="10" height="30" stroke-width="3"/>
          <path d="M 100 0 Q 112 12 100 20 Q 88 12 100 0 Z" stroke-width="3"/>
          <!-- Cake Plate / Stand -->
          <ellipse cx="100" cy="235" rx="95" ry="15" stroke-width="5"/>
        </g>

        <!-- Left Animal Friend (Cute Puppy/Bear) -->
        <g transform="translate(60, 420)">
          <circle cx="80" cy="110" r="45" stroke-width="6"/>
          <circle cx="50" cy="75" r="16" stroke-width="5"/>
          <circle cx="110" cy="75" r="16" stroke-width="5"/>
          <!-- Eyes and smiling mouth -->
          <circle cx="68" cy="105" r="7" fill="#000000"/>
          <circle cx="92" cy="105" r="7" fill="#000000"/>
          <ellipse cx="80" cy="118" rx="8" ry="5" fill="#000000"/>
          <path d="M 72 126 Q 80 134 88 126" fill="none" stroke-width="4"/>
          <!-- Party Hat -->
          <polygon points="60,70 80,15 100,70" stroke-width="4"/>
          <circle cx="80" cy="12" r="6" stroke-width="3"/>
          <!-- Body -->
          <path d="M 45 150 Q 80 145 115 150 L 125 210 L 35 210 Z" stroke-width="6"/>
          <!-- Holding a Balloon String -->
          <line x1="110" y1="160" x2="110" y2="-40" stroke-width="3"/>
          <ellipse cx="110" cy="-90" rx="35" ry="48" stroke-width="5"/>
          <polygon points="105,-42 110,-35 115,-42" stroke-width="3"/>
        </g>

        <!-- Right Animal Friend (Cute Kitty / Bunny) -->
        <g transform="translate(380, 410)">
          <circle cx="80" cy="110" r="45" stroke-width="6"/>
          <!-- Tall Bunny Ears -->
          <ellipse cx="60" cy="40" rx="14" ry="40" stroke-width="5"/>
          <ellipse cx="100" cy="40" rx="14" ry="40" stroke-width="5"/>
          <!-- Eyes & Whiskers -->
          <circle cx="68" cy="105" r="7" fill="#000000"/>
          <circle cx="92" cy="105" r="7" fill="#000000"/>
          <path d="M 72 122 Q 80 130 88 122" fill="none" stroke-width="4"/>
          <line x1="45" y1="115" x2="20" y2="110" stroke-width="3"/>
          <line x1="45" y1="122" x2="20" y2="128" stroke-width="3"/>
          <line x1="115" y1="115" x2="140" y2="110" stroke-width="3"/>
          <line x1="115" y1="122" x2="140" y2="128" stroke-width="3"/>
          <!-- Body -->
          <path d="M 45 150 Q 80 145 115 150 L 125 220 L 35 220 Z" stroke-width="6"/>
          <!-- Holding Star Wand -->
          <line x1="50" y1="160" x2="20" y2="90" stroke-width="4"/>
          <polygon points="20,70 26,84 40,84 28,94 33,108 20,98 7,108 12,94 0,84 14,84" stroke-width="3"/>
        </g>

        <!-- Floating Sparkles & Confetti Pieces -->
        <rect x="180" y="270" width="12" height="12" stroke-width="3" transform="rotate(25 180 270)"/>
        <rect x="360" y="290" width="14" height="8" stroke-width="3" transform="rotate(-35 360 290)"/>
        <circle cx="150" cy="320" r="6" stroke-width="3"/>
        <circle cx="420" cy="330" r="8" stroke-width="3"/>
        <circle cx="280" cy="310" r="5" stroke-width="3"/>
      </g>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
    ${outerFrame}
    ${sceneArtwork}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// -------------------------------------------------------------
// 1. Generate Storyboard API
// Generates 5 distinct, chronologically varied scenes tailored to art style
// -------------------------------------------------------------
app.post('/api/generate-storyboard', async (req, res) => {
  try {
    const {
      theme,
      childName,
      ageGroup = '5-8',
      artStyle = 'storybook',
      isPro = false,
    } = req.body;

    if (!theme || !childName) {
      return res.status(400).json({ error: 'Theme and child name are required.' });
    }

    const styleDesc = STYLE_PROMPT_MODIFIERS[artStyle] || STYLE_PROMPT_MODIFIERS['storybook'];

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Using curated rich storyboard fallback.');
      const diverseTitles = [
        { title: 'The Great Journey Begins', caption: `3... 2... 1... ${childName} blasts off into the magnificent ${theme} realm!`, tip: 'Color the launch flames bright orange and yellow!' },
        { title: 'A Curious New Best Friend', caption: `A friendly creature floats down with an astronaut helmet to say hello to ${childName}.`, tip: 'Give the character shiny bubble reflections on the glass!' },
        { title: 'The Mysterious Treasure Valley', caption: `Exploring secret craters and underwater caves filled with glowing space crystals.`, tip: 'Try rainbow metallic colors on the crystal gems!' },
        { title: 'Flying High Through the Clouds', caption: `Soaring over castle towers and planetary rings with sparkling wind trails.`, tip: 'Leave soft white clouds and use sky blue for the breeze!' },
        { title: 'The Starlight Campfire Celebration', caption: `Gathering with friends under a crescent moon for sweet treats and bedtime stories.`, tip: 'Color the celebration banners with every crayon in your box!' }
      ];

      return res.json({
        bookTitle: `${childName}'s Ultimate ${theme} Coloring Odyssey`,
        bookSubtitle: `A 5-Chapter Printable Adventure Created for ${childName}`,
        dedication: `Specially crafted for ${childName}. Fill these pages with courage, joy, and your most magical colors!`,
        coverPrompt: `Children's coloring book cover art, ${theme} featuring hero character in ${styleDesc}`,
        pages: diverseTitles.map((p, idx) => ({
          pageNumber: idx + 1,
          title: p.title,
          caption: p.caption,
          coloringTip: p.tip,
          prompt: `Black and white children's coloring book line art, ${styleDesc}, scene: ${p.title} - ${p.caption}`,
          sceneCategory: `chapter-${idx + 1}`
        })),
      });
    }

    const promptText = `You are a master children's coloring book author and art director.
Create a rich, 5-page coloring book outline for a child named "${childName}" with the theme "${theme}".
Target Age Group: ${ageGroup} years old.
Chosen Artistic Style: ${artStyle} (${styleDesc}).

CRITICAL REQUIREMENT: The 5 pages MUST NOT be repetitive or the same photo/character! They must show 5 DRAMATICALLY DIFFERENT scene compositions across a complete story arc:
- Page 1: The Epic Beginning / Launch / Arrival (wide scenery, dynamic motion, journey start).
- Page 2: Close-up Character Encounter / Cute Quirky Companion (intimate character portrait, funny outfit, whimsical gadget).
- Page 3: Active Exploration & Discovery (landscape with caves/craters/trees/water, searching for hidden items).
- Page 4: Heroic Action or Playful Challenge (soaring/swimming/racing/building with friends).
- Page 5: Joyful Celebration Finale & Rest (campfire feast, awards, cozy crescent moon starlight sleep).

Provide in clean JSON:
1. bookTitle: Catchy, memorable title featuring ${childName} and the theme.
2. bookSubtitle: Inspiring subtitle.
3. dedication: Heartfelt 1-2 sentence dedication to ${childName}.
4. coverPrompt: Detailed cover illustration prompt.
5. Exactly 5 pages, each with:
   - pageNumber (1 to 5)
   - title (3 to 6 words)
   - caption (1 to 2 engaging sentences suitable for a child)
   - coloringTip (creative crayon color suggestion)
   - prompt (high-contrast black and white children's coloring book line art, solid black outlines, unshaded white spaces, completely unfilled for coloring, no grayscale, no photo-realism)
   - sceneCategory (e.g. 'launch', 'character-portrait', 'exploration', 'action', 'celebration')`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bookTitle: { type: Type.STRING },
            bookSubtitle: { type: Type.STRING },
            dedication: { type: Type.STRING },
            coverPrompt: { type: Type.STRING },
            pages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pageNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  caption: { type: Type.STRING },
                  coloringTip: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  sceneCategory: { type: Type.STRING },
                },
                required: ['pageNumber', 'title', 'caption', 'coloringTip', 'prompt'],
              },
            },
          },
          required: ['bookTitle', 'bookSubtitle', 'dedication', 'coverPrompt', 'pages'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.pages || parsed.pages.length === 0) {
      throw new Error('Failed to parse structured storyboard from model.');
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating storyboard:', error);
    res.status(500).json({ error: error.message || 'Failed to generate storyboard.' });
  }
});

// -------------------------------------------------------------
// 2. Generate Coloring Page Image API
// Supports:
// - gemini-3-pro-image-preview with imageSize: "1K" | "2K" | "4K"
// - Diverse vector line-art engine fallback so it NEVER generates only one type of photo!
// -------------------------------------------------------------
app.post('/api/generate-coloring-page', async (req, res) => {
  try {
    const {
      prompt,
      imageSize = '1K',
      aspectRatio = '3:4',
      title = 'Coloring Page',
      theme = 'Adventure',
      pageNumber = 1,
      artStyle = 'storybook',
      childName = 'Artist',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '1K';
    const chosenAspect = ['3:4', '1:1', '4:3'].includes(aspectRatio) ? aspectRatio : '3:4';
    const styleModifier = STYLE_PROMPT_MODIFIERS[artStyle] || STYLE_PROMPT_MODIFIERS['storybook'];

    const refinedPrompt = `Ultra-clean black and white children's coloring book line art. Pure white paper background, completely unfilled white regions, bold solid black outlines, no shading, no greyscale, no gradient, no textures, no color whatsoever, crisp printable line art. Style: ${styleModifier}. Detailed scene: ${prompt}`;

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not present; serving rich diverse vector coloring art.');
      const svgUrl = generateThematicColoringSvg(title, theme, pageNumber, artStyle);
      return res.json({
        imageUrl: svgUrl,
        model: 'vector-diverse-engine',
        imageSize: chosenSize,
        aspectRatio: chosenAspect,
        pageNumber,
      });
    }

    // Cache quota exhaustion to avoid repeatedly hitting 429 limits
    if (globalImageQuotaExhaustedUntil && Date.now() < globalImageQuotaExhaustedUntil) {
      const svgUrl = generateThematicColoringSvg(title, theme, pageNumber, artStyle);
      return res.json({
        imageUrl: svgUrl,
        model: 'vector-diverse-engine',
        imageSize: chosenSize,
        aspectRatio: chosenAspect,
        pageNumber,
        quotaExceeded: true,
      });
    }

    // Attempt generation with gemini-3-pro-image-preview
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: refinedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenAspect,
            imageSize: chosenSize as any,
          },
        },
      });

      let base64Image = '';
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            base64Image = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (base64Image) {
        return res.json({
          imageUrl: base64Image,
          model: 'gemini-3-pro-image-preview',
          imageSize: chosenSize,
          aspectRatio: chosenAspect,
          pageNumber,
        });
      }
      throw new Error('No image part in response.');
    } catch (imageModelErr: any) {
      const errMsg = imageModelErr?.message || '';
      const is429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');

      if (is429) {
        // Mark image quota exhausted for 15 minutes to prevent hammering API
        globalImageQuotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
      }

      // If not 429, try gemini-3.1-flash-lite-image
      if (!is429) {
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [{ text: refinedPrompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: chosenAspect,
              },
            },
          });

          let fallbackBase64 = '';
          if (fallbackResponse.candidates && fallbackResponse.candidates[0]?.content?.parts) {
            for (const part of fallbackResponse.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mime = part.inlineData.mimeType || 'image/png';
                fallbackBase64 = `data:${mime};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (fallbackBase64) {
            return res.json({
              imageUrl: fallbackBase64,
              model: 'gemini-3.1-flash-lite-image',
              imageSize: chosenSize,
              aspectRatio: chosenAspect,
              fallbackUsed: true,
              pageNumber,
            });
          }
        } catch {
          // Gracefully continue to vector engine
        }
      }

      // Use rich, distinct multi-scene vector line-art engine
      const svgUrl = generateThematicColoringSvg(title, theme, pageNumber, artStyle);
      return res.json({
        imageUrl: svgUrl,
        model: 'vector-diverse-engine',
        imageSize: chosenSize,
        aspectRatio: chosenAspect,
        pageNumber,
        quotaExceeded: is429,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/generate-coloring-page:', error);
    res.status(500).json({ error: error.message || 'Image generation failed.' });
  }
});

// -------------------------------------------------------------
// 3. Pro Subscription & Checkout API ($5 USD)
// -------------------------------------------------------------
app.get('/api/subscription/plans', (_req, res) => {
  res.json({
    proPlan: {
      id: 'pro-artist-monthly',
      name: 'WonderColor Pro Artist Pass',
      priceUsd: 5.0,
      currency: 'USD',
      billingInterval: 'one-time or monthly',
      features: [
        'Ultra-Crisp 4K Print Resolution for all pages',
        'All 6 Artistic Styles (Chunky, Storybook, Kawaii, Mandala, Comic, Wildlife)',
        'Unlimited Book Generations and Single-Page Redraws',
        'Real-Time Live Drawing Animation & Instant Preview',
        'Deluxe Gold Foil Print Cover & Master Artist Award Certificate',
        'Priority Gemini AI Line-Art Generation Queue',
        'Ad-Free & Unlimited PDF Booklets'
      ],
      couponCodes: ['MAGIC5', 'ARTIST50', 'WONDERKID'],
    },
  });
});

app.post('/api/subscription/checkout', (req, res) => {
  const { paymentMethod = 'card', couponCode, childName } = req.body;
  const isCouponValid = couponCode && ['MAGIC5', 'ARTIST50', 'WONDERKID'].includes(couponCode.toUpperCase().trim());

  // Simulate payment processing
  const receiptId = `WC_SUB_${Date.now().toString(36).toUpperCase()}`;

  res.json({
    success: true,
    isPro: true,
    tier: 'pro',
    receiptId,
    amountPaid: isCouponValid && couponCode.toUpperCase().trim() === 'MAGIC5' ? 0.0 : 5.0,
    currency: 'USD',
    activatedAt: new Date().toISOString(),
    message: `Congratulations! WonderColor Pro is now activated for ${childName || 'your young artist'}!`,
  });
});

// -------------------------------------------------------------
// 4. Multi-turn Chat Assistant API
// -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, bookContext, model = 'gemini-3.8-flash' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const validModels = ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-3.1-flash-lite'];
    const chosenModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        role: 'model',
        model: 'mock-assistant',
        content: `Hello! I'm Barnaby the Bookworm 🐛📚! I love the "${bookContext?.theme || 'coloring'}" theme for ${bookContext?.childName || 'the child'}. We now have 6 distinct art styles (Chunky, Storybook, Kawaii Chibi, Mandala, Comic, and Wildlife) and real-time generation! Which style would you like to explore next?`,
      });
    }

    const systemInstruction = `You are Barnaby the Bookworm, a warm, joyful, and creative children's coloring book author and art director.
You help parents, teachers, and kids craft the ultimate 5-page printable coloring books.
Roles:
1. Brainstorm creative twists on themes and ensure 5 diverse, non-repetitive scene chapters.
2. Recommend the best Art Style:
   - 'toddler-chunky' (Ages 2-4: huge friendly shapes, extra thick lines)
   - 'storybook' (Ages 5-8: classic fairytale warmth)
   - 'kawaii' (Chibi sweets, stars, super-cute smiling faces)
   - 'mandala' (Geometric patterns for older kids)
   - 'comic' (Action angles, speed lines, sound effect bursts)
   - 'wildlife' (Lush nature and realistic animals)
3. Suggest crayon & marker palettes.
4. Help explain the $5 Pro pass perks (4K resolution, all 6 styles, priority queue).

Context:
Child Name: ${bookContext?.childName || 'Child'}
Theme: ${bookContext?.theme || 'Creative Adventure'}
Age: ${bookContext?.ageGroup || '5-8'}
Title: ${bookContext?.bookTitle || 'Untitled'}
Pages: ${JSON.stringify(bookContext?.pages || [])}`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({
      role: 'model',
      model: chosenModel,
      content: response.text || 'I love that idea! What should we design next?',
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: error.message || 'Chat service error.' });
  }
});

// Vite middleware or static serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
