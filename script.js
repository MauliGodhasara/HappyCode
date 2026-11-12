// -----------------------------
// Background Music Controller
// -----------------------------
let music = new Audio("music/bgmusic.mp3");
music.loop = true;
music.volume = 0.5;
let musicPlaying = false;

// try to resume across pages
window.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("music-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (!musicPlaying) {
        music.play();
        musicPlaying = true;
        toggleBtn.textContent = "🔊";
      } else {
        music.pause();
        musicPlaying = false;
        toggleBtn.textContent = "🔈";
      }
    });
  }
});

// -----------------------------
// Continue Button Handler
// -----------------------------
function goTo(page) {
  window.location.href = page;
}

// -----------------------------
// Hearts Animation + Reasons
// -----------------------------
// Handles clicking on hearts
const reasons = [
  "My greatest motivator and supporter ever✨.",
  "You listen to me like no one else ever has❤️.",
  "My fiercest rival in games🎮💘.",
  "Your love makes me question my 'Nonchalantness'😤.",
  "Your smile, eyes, smell, hair and so much more (forehead). That butt tho...🍑.",
  "You give the best and longest hugs🤗."
];

// Updated heart click handling (horizontal bubbles, proper direction)
document.addEventListener('DOMContentLoaded', () => {
  const hearts = document.querySelectorAll('.heart');
  let revealed = 0;

  hearts.forEach((heart, i) => {
    heart.addEventListener('click', (ev) => {
      if (heart.classList.contains('popped')) return;
      heart.classList.add('popped');

      // Create bubble element
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      bubble.textContent = reasons[i];

      // Append to body (so it's not clipped by heart element)
      document.body.appendChild(bubble);

      // compute heart position for placing bubble
      const heartRect = heart.getBoundingClientRect();
      const bubbleWidth = Math.min(340, Math.max(220, Math.floor(window.innerWidth * 0.28)));

      // Vertical center - place bubble vertically centered on heart
      const top = heartRect.top + heartRect.height / 2;
      bubble.style.top = (top) + 'px';
      bubble.style.transform = 'translateY(-50%)';

      // Determine side and place bubble to left or right of the heart
      const side = heart.getAttribute('data-side'); // 'left' or 'right'

      // Add class for pointer direction and compute horizontal position
      if (side === 'left') {
        // place bubble to the LEFT of the heart (away from bouquet)
        bubble.classList.add('point-right'); // arrow on right side of bubble
        const right = window.innerWidth - heartRect.left + 16; // some padding from heart
        bubble.style.right = right + 'px';
        bubble.style.left = 'auto';
      } else {
        // place bubble to the RIGHT of the heart
        bubble.classList.add('point-left'); // arrow on left side of bubble
        const left = heartRect.right + 16; // 16px gap from heart
        bubble.style.left = left + 'px';
        bubble.style.right = 'auto';
      }

      // Prevent overlapping by nudging bubble vertically if collision detected
      // (simple strategy: shift up/down if overlapping existing bubbles)
      const existing = Array.from(document.querySelectorAll('.bubble')).filter(b => b !== bubble);
      existing.forEach(ex => {
        const eb = ex.getBoundingClientRect();
        const bb = bubble.getBoundingClientRect();
        if (Math.abs(bb.top - eb.top) < 60 && Math.abs(bb.left - eb.left) < 240) {
          // shift this bubble up a bit
          const newTop = (parseFloat(bubble.style.top) || top) - 50;
          bubble.style.top = newTop + 'px';
        }
      });

      revealed++;
      if (revealed === hearts.length) {
        // show continue button after a short delay
        setTimeout(() => {
          const cont = document.querySelector('.continue');
          if (cont) cont.style.display = 'inline-block';
        }, 400);
      }
    });
  });
});

