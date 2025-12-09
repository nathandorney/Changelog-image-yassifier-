"use client";

import { useRef, useState, useEffect } from "react";

const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 824;
const BACKGROUND_COLOR = "#F8F5F0";
const PADDING = 60;

export default function ImageEditor() {
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [copied, setCopied] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (image) {
			drawImageOnCanvas(image);
		}
	}, [image]);

	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			for (let i = 0; i < items.length; i++) {
				if (items[i].type.indexOf("image") !== -1) {
					const blob = items[i].getAsFile();
					if (blob) {
						loadImageFromFile(blob);
					}
				}
			}
		};

		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, []);

	const drawImageOnCanvas = (img: HTMLImageElement) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;

		ctx.fillStyle = BACKGROUND_COLOR;
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		const availableWidth = CANVAS_WIDTH - PADDING * 2;
		const availableHeight = CANVAS_HEIGHT - PADDING * 2;

		const scale = Math.min(
			availableWidth / img.width,
			availableHeight / img.height,
		);
		const scaledWidth = img.width * scale;
		const scaledHeight = img.height * scale;

		const x = (CANVAS_WIDTH - scaledWidth) / 2;
		const y = (CANVAS_HEIGHT - scaledHeight) / 2;

		const borderRadius = 18;

		ctx.save();

		// Draw shadow
		ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
		ctx.shadowBlur = 16;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 4;

		ctx.beginPath();
		ctx.moveTo(x + borderRadius, y);
		ctx.lineTo(x + scaledWidth - borderRadius, y);
		ctx.quadraticCurveTo(x + scaledWidth, y, x + scaledWidth, y + borderRadius);
		ctx.lineTo(x + scaledWidth, y + scaledHeight - borderRadius);
		ctx.quadraticCurveTo(
			x + scaledWidth,
			y + scaledHeight,
			x + scaledWidth - borderRadius,
			y + scaledHeight,
		);
		ctx.lineTo(x + borderRadius, y + scaledHeight);
		ctx.quadraticCurveTo(
			x,
			y + scaledHeight,
			x,
			y + scaledHeight - borderRadius,
		);
		ctx.lineTo(x, y + borderRadius);
		ctx.quadraticCurveTo(x, y, x + borderRadius, y);
		ctx.closePath();
		ctx.fillStyle = BACKGROUND_COLOR;
		ctx.fill();

		// Remove shadow for image drawing
		ctx.shadowColor = "transparent";
		ctx.clip();

		ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

		ctx.restore();

		ctx.beginPath();
		ctx.moveTo(x + borderRadius, y);
		ctx.lineTo(x + scaledWidth - borderRadius, y);
		ctx.quadraticCurveTo(x + scaledWidth, y, x + scaledWidth, y + borderRadius);
		ctx.lineTo(x + scaledWidth, y + scaledHeight - borderRadius);
		ctx.quadraticCurveTo(
			x + scaledWidth,
			y + scaledHeight,
			x + scaledWidth - borderRadius,
			y + scaledHeight,
		);
		ctx.lineTo(x + borderRadius, y + scaledHeight);
		ctx.quadraticCurveTo(
			x,
			y + scaledHeight,
			x,
			y + scaledHeight - borderRadius,
		);
		ctx.lineTo(x, y + borderRadius);
		ctx.quadraticCurveTo(x, y, x + borderRadius, y);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
		ctx.lineWidth = 1;
		ctx.stroke();
	};

	const loadImageFromFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				setImage(img);
			};
			img.src = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	const handleDownload = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.toBlob((blob) => {
			if (!blob) return;

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "styled-image.png";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, "image/png");
	};

	const handleCopyToClipboard = async () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.toBlob(async (blob) => {
			if (!blob) return;

			try {
				await navigator.clipboard.write([
					new ClipboardItem({ "image/png": blob }),
				]);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error("Failed to copy image to clipboard:", err);
			}
		}, "image/png");
	};

	return (
		<div className="flex flex-col items-center gap-6 w-full max-w-7xl mx-auto p-8">
			<h1 className="text-4xl font-bold text-zinc-900 mb-2">
				Changelog image yassifier 💅
			</h1>

			{!image && (
				<div className="w-full border-2 border-dashed rounded-lg p-12 text-center border-zinc-300 bg-zinc-50">
					<div className="flex flex-col items-center gap-4">
						<svg
							className="w-16 h-16 text-zinc-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<div>
							<p className="text-2xl font-semibold text-zinc-700 mb-2">
								Paste your screenshot
							</p>
							<p className="text-zinc-600">
								Press Cmd+V to paste the screenshot from your clipboard
							</p>
						</div>
					</div>
				</div>
			)}

			{image && (
				<div className="flex flex-col items-center gap-4 w-full">
					<canvas
						ref={canvasRef}
						className=" max-w-full h-auto"
						style={{ maxWidth: "100%", height: "auto" }}
					/>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={handleCopyToClipboard}
							className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer w-[140px]"
						>
							{copied ? "Copied!" : "Copy image"}
						</button>
						<button
							type="button"
							onClick={handleDownload}
							className="px-6 py-3 text-black rounded-lg border border-gray-300 transition-colors font-medium cursor-pointer"
						>
							Download
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
