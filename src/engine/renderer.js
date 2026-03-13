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

function drawObstacleTelegraph(ctx, drawX, entity, world, player, config) {
  const telegraphCfg = config.telegraph || {};
  const maxSeconds = Math.max(0.2, Number(telegraphCfg.maxLeadSeconds || 1.2));
  const minSeconds = Math.max(0.05, Number(telegraphCfg.minLeadSeconds || 0.2));
  const playerFront = world.cameraX + player.x + player.width;
  const obstacleFront = entity.x + entity.width;
  const distanceAhead = obstacleFront - playerFront;

  if (distanceAhead <= 0 || world.speed <= 0) return;
  const timeToImpact = distanceAhead / world.speed;
  if (timeToImpact < minSeconds || timeToImpact > maxSeconds) return;

  const t = 1 - (timeToImpact - minSeconds) / Math.max(0.001, maxSeconds - minSeconds);
  const alpha = 0.18 + t * 0.45;

  ctx.fillStyle = `rgba(255, 193, 92, ${alpha.toFixed(3)})`;
  ctx.fillRect(drawX - 3, world.groundY - 6, entity.width + 6, 6);

  ctx.fillStyle = `rgba(255, 235, 200, ${(alpha + 0.15).toFixed(3)})`;
  ctx.beginPath();
  ctx.moveTo(drawX + entity.width * 0.5, entity.y - 16);
  ctx.lineTo(drawX + entity.width * 0.5 - 7, entity.y - 4);
  ctx.lineTo(drawX + entity.width * 0.5 + 7, entity.y - 4);
  ctx.closePath();
  ctx.fill();
}

export function createRenderer({ canvas, config, assets = null }) {
  const ctx = canvas.getContext('2d');

  return {
    draw(state) {
      const metrics = syncCanvasToDisplay(canvas, ctx);
      const world = state.world;
      const player = state.player;
      world.canvasHeight = metrics.cssHeight;
      world.groundY = Math.round(metrics.cssHeight * world.groundRatio);

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
            drawObstacleTelegraph(ctx, drawX, e, world, player, config);
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

        ctx.fillText(title, metrics.cssWidth * 0.5, metrics.cssHeight * 0.34);
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = '#c4d5f5';
        ctx.fillText(`Goal: reach ${Math.floor(world.targetDistance)}m`, metrics.cssWidth * 0.5, metrics.cssHeight * 0.4);
        if (!world.started) {
          ctx.fillText('JUMP = avoid gaps/obstacles', metrics.cssWidth * 0.5, metrics.cssHeight * 0.45);
          ctx.fillText('Double-jump for tight windows', metrics.cssWidth * 0.5, metrics.cssHeight * 0.49);
          ctx.fillText('Collect crystal streaks for armor boost', metrics.cssWidth * 0.5, metrics.cssHeight * 0.53);
        }
        ctx.fillStyle = '#9fb4dc';
        ctx.fillText(hint, metrics.cssWidth * 0.5, metrics.cssHeight * 0.59);
      }
    }
  };
}
