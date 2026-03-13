function syncCanvasToDisplay(canvas, ctx) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const width = Math.floor(rect.width * dpr);
  const height = Math.floor(rect.height * dpr);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return {
    cssWidth: rect.width,
    cssHeight: rect.height
  };
}

function drawSpriteOrFallback(ctx, image, x, y, width, height, drawFallback) {
  if (image) {
    ctx.drawImage(image, x, y, width, height);
    return;
  }

  drawFallback();
}

export function createRenderer({ canvas, config, assets = null }) {
  const ctx = canvas.getContext('2d');

  return {
    draw(state) {
      const metrics = syncCanvasToDisplay(canvas, ctx);
      const world = state.world;
      const player = state.player;
      world.canvasHeight = metrics.cssHeight;

      ctx.fillStyle = config.render.bgColor;
      ctx.fillRect(0, 0, metrics.cssWidth, metrics.cssHeight);

      ctx.fillStyle = config.render.groundColor;
      ctx.fillRect(0, world.groundY, metrics.cssWidth, metrics.cssHeight - world.groundY);

      for (const e of world.entities) {
        const drawX = e.x - world.cameraX;
        if (drawX + e.width < 0 || drawX > metrics.cssWidth) continue;

        switch (e.kind) {
          case 'obstacle': {
            const sprite = assets?.getImage('obstacle') || null;
            drawSpriteOrFallback(ctx, sprite, drawX, e.y, e.width, e.height, () => {
              ctx.fillStyle = config.render.obstacleColor;
              ctx.fillRect(drawX, e.y, e.width, e.height);
            });
            break;
          }
          case 'crystal': {
            const sprite = assets?.getImage('crystal') || null;
            drawSpriteOrFallback(ctx, sprite, drawX, e.y, e.width, e.height, () => {
              ctx.fillStyle = config.render.crystalColor;
              ctx.beginPath();
              ctx.moveTo(drawX + e.width * 0.5, e.y);
              ctx.lineTo(drawX + e.width, e.y + e.height * 0.5);
              ctx.lineTo(drawX + e.width * 0.5, e.y + e.height);
              ctx.lineTo(drawX, e.y + e.height * 0.5);
              ctx.closePath();
              ctx.fill();
            });
            break;
          }
          case 'heart': {
            const sprite = assets?.getImage('heart') || null;
            drawSpriteOrFallback(ctx, sprite, drawX, e.y, e.width, e.height, () => {
              ctx.fillStyle = config.render.heartColor;
              ctx.beginPath();
              ctx.arc(drawX + 6, e.y + 7, 6, 0, Math.PI * 2);
              ctx.arc(drawX + 14, e.y + 7, 6, 0, Math.PI * 2);
              ctx.lineTo(drawX + 10, e.y + 22);
              ctx.closePath();
              ctx.fill();
            });
            break;
          }
          default:
            break;
        }
      }

      if (!(player.invulnTime > 0 && Math.floor(player.invulnTime * 16) % 2 === 0)) {
        const playerSprite = assets?.getImage('player') || null;
        drawSpriteOrFallback(ctx, playerSprite, player.x, player.y, player.width, player.height, () => {
          ctx.fillStyle = config.render.playerColor;
          ctx.fillRect(player.x, player.y, player.width, player.height);
        });
      }

      if (!world.started || world.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, metrics.cssWidth, metrics.cssHeight);

        ctx.fillStyle = '#dce8ff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px system-ui, sans-serif';

        const title = !world.started ? 'Sky Rat Runner' : world.gameWon ? 'Victory!' : 'Game Over';
        const hint = !world.started
          ? 'Press JUMP or Space to start'
          : 'Press JUMP or Space to play again';

        ctx.fillText(title, metrics.cssWidth * 0.5, metrics.cssHeight * 0.42);
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = '#9fb4dc';
        ctx.fillText(`Goal: reach ${Math.floor(world.targetDistance)}m`, metrics.cssWidth * 0.5, metrics.cssHeight * 0.48);
        ctx.fillText(hint, metrics.cssWidth * 0.5, metrics.cssHeight * 0.53);
      }
    }
  };
}
