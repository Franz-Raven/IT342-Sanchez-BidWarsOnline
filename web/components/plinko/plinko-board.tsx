"use client";

import { useRef, useEffect } from "react";
import Matter from "matter-js";

interface PlinkoBoardProps {
  ballPath?: string[];
  bucketPosition?: number;
  riskLevel: string;
  onAnimationComplete?: () => void;
}

const ROWS = 14;
const PIN_RADIUS = 6;
const BALL_RADIUS = 12;
const HORIZONTAL_SPACING = 45;
const VERTICAL_SPACING = 45;
const BUCKET_HEIGHT = 80;

export function PlinkoBoard({ ballPath, bucketPosition, riskLevel, onAnimationComplete }: PlinkoBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);

  const getMultipliers = (risk: string) => {
    switch (risk.toUpperCase()) {
      case "LOW":
        return [18.0, 3.2, 1.6, 1.3, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.3, 1.6, 3.2, 18.0];
      case "HIGH":
        return [353.0, 49.0, 14.0, 5.3, 2.1, 0.5, 0.2, 0.0, 0.2, 0.5, 2.1, 5.3, 14.0, 49.0, 353.0];
      case "MEDIUM":
      default:
        return [55.0, 12.0, 5.6, 3.2, 1.6, 1.0, 0.7, 0.2, 0.7, 1.0, 1.6, 3.2, 5.6, 12.0, 55.0];
    }
  };

  const getBucketColor = (multiplier: number) => {
    if (multiplier >= 30) return "#ef4444"; // red
    if (multiplier >= 10) return "#f97316"; // orange
    if (multiplier >= 3) return "#eab308"; // yellow
    if (multiplier >= 1) return "#10b981"; // green
    return "#6366f1"; // blue
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    
    // Wait for container to have dimensions
    const checkDimensions = () => {
      const width = container?.clientWidth || 0;
      const height = container?.clientHeight || 0;
      
      if (width === 0 || height === 0) {
        requestAnimationFrame(checkDimensions);
        return;
      }
      
      canvas.width = width;
      canvas.height = height;

      // Create engine
      const engine = Matter.Engine.create({
        gravity: { x: 0, y: 1.0 },
      });
      engineRef.current = engine;

      // Create renderer
      const render = Matter.Render.create({
        canvas: canvas,
        engine: engine,
        options: {
          width: width,
          height: height,
          wireframes: false,
          background: "#0f172a",
        },
      });
      renderRef.current = render;

      const multipliers = getMultipliers(riskLevel);
      const numBuckets = multipliers.length;

      // Calculate board dimensions
      const boardWidth = (numBuckets - 1) * HORIZONTAL_SPACING;
      const boardHeight = ROWS * VERTICAL_SPACING + BUCKET_HEIGHT;
      const offsetX = (width - boardWidth) / 2;
      const offsetY = 80;

      // Create pins
      const pins: Matter.Body[] = [];
      for (let row = 0; row < ROWS; row++) {
        const pinsInRow = row + 3;
        const rowWidth = (pinsInRow - 1) * HORIZONTAL_SPACING;
        const rowOffsetX = offsetX + (boardWidth - rowWidth) / 2;

        for (let col = 0; col < pinsInRow; col++) {
          const pin = Matter.Bodies.circle(
            rowOffsetX + col * HORIZONTAL_SPACING,
            offsetY + row * VERTICAL_SPACING,
            PIN_RADIUS,
            {
              isStatic: true,
              render: {
                fillStyle: "#94a3b8",
                strokeStyle: "#cbd5e1",
                lineWidth: 2,
              },
            }
          );
          pins.push(pin);
        }
      }

      // Create buckets
      const buckets: Matter.Body[] = [];
      const bucketWidth = HORIZONTAL_SPACING * 0.9;
      const bucketY = offsetY + ROWS * VERTICAL_SPACING + BUCKET_HEIGHT / 2;

      for (let i = 0; i < numBuckets; i++) {
        const bucketX = offsetX + i * HORIZONTAL_SPACING;
        const multiplier = multipliers[i];
        const color = getBucketColor(multiplier);

        const bucket = Matter.Bodies.rectangle(
          bucketX,
          bucketY,
          bucketWidth,
          BUCKET_HEIGHT,
          {
            isStatic: true,
            render: {
              fillStyle: color,
              opacity: 0.5,
              strokeStyle: color,
              lineWidth: 2,
            },
            label: `bucket-${i}`,
          }
        );
        buckets.push(bucket);
      }

      // Add walls
      const wallThickness = 20;
      const leftWall = Matter.Bodies.rectangle(
        offsetX - HORIZONTAL_SPACING / 2 - wallThickness / 2,
        height / 2,
        wallThickness,
        height,
        {
          isStatic: true,
          render: { fillStyle: "#1e293b" },
        }
      );

      const rightWall = Matter.Bodies.rectangle(
        offsetX + boardWidth + HORIZONTAL_SPACING / 2 + wallThickness / 2,
        height / 2,
        wallThickness,
        height,
        {
          isStatic: true,
          render: { fillStyle: "#1e293b" },
        }
      );

      const floor = Matter.Bodies.rectangle(
        width / 2,
        bucketY + BUCKET_HEIGHT,
        width,
        20,
        {
          isStatic: true,
          render: { fillStyle: "#1e293b" },
        }
      );

      // Add all bodies to world
      Matter.World.add(engine.world, [...pins, ...buckets, leftWall, rightWall, floor]);

      // Run engine and renderer
      Matter.Runner.run(engine);
      Matter.Render.run(render);
    };
    
    checkDimensions();

    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
      }
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, [riskLevel]);

  useEffect(() => {
    if (!ballPath || !engineRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    const width = container?.clientWidth || 800;
    const height = container?.clientHeight || 800;
    const engine = engineRef.current;

    const multipliers = getMultipliers(riskLevel);
    const numBuckets = multipliers.length;
    const boardWidth = (numBuckets - 1) * HORIZONTAL_SPACING;
    const offsetX = (width - boardWidth) / 2;
    const offsetY = 80;

    // Remove previous ball if exists
    if (ballRef.current) {
      Matter.World.remove(engine.world, ballRef.current);
      ballRef.current = null;
    }

    // Create ball at drop position
    const startX = offsetX + (boardWidth / 2);
    const ball = Matter.Bodies.circle(startX, offsetY - 30, BALL_RADIUS, {
      restitution: 0.8,
      friction: 0.001,
      density: 0.001,
      render: {
        fillStyle: "#10b981",
        strokeStyle: "#34d399",
        lineWidth: 2,
      },
      label: "ball",
    });

    ballRef.current = ball;
    Matter.World.add(engine.world, ball);

    // Guide ball based on path
    let pathIndex = 0;
    const guideBall = () => {
      if (!ballRef.current || pathIndex >= ballPath.length) {
        if (onAnimationComplete) {
          setTimeout(onAnimationComplete, 1000);
        }
        return;
      }

      const direction = ballPath[pathIndex];
      const forceX = direction === "L" ? -0.002 : 0.002;
      Matter.Body.applyForce(ballRef.current, ballRef.current.position, { x: forceX, y: 0 });

      pathIndex++;
      setTimeout(guideBall, 150);
    };

    setTimeout(guideBall, 300);
  }, [ballPath, riskLevel, onAnimationComplete]);

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-end px-4">
        <div className="flex gap-1 items-end">
          {getMultipliers(riskLevel).map((multiplier, index) => {
            const color = getBucketColor(multiplier);
            const isTarget = bucketPosition === index;
            return (
              <div
                key={index}
                className={`flex flex-col items-center transition-all ${
                  isTarget ? "scale-110" : ""
                }`}
                style={{ width: `${HORIZONTAL_SPACING * 0.9}px` }}
              >
                <div
                  className={`w-full text-center text-[10px] font-bold px-1 py-1 rounded ${
                    isTarget ? "ring-2 ring-white" : ""
                  }`}
                  style={{ 
                    backgroundColor: color, 
                    color: multiplier < 1 ? "#fff" : "#000"
                  }}
                >
                  {multiplier}x
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
