import React, { useEffect, useState } from "react";
import "./App.css";

import * as RgbQuant from "rgbquant";


const GOLDEN_RATIO = (Math.sqrt(5) + 1) / 2;


export class GoldenNumberGenerator {
  private curVal: number;

  constructor(seed?: number) {
    this.curVal = seed == null ? Math.random() : seed;
  }

  next() {
    this.curVal = (this.curVal + GOLDEN_RATIO) % 1;
    return this.curVal;
  }
}

function aptosSVG() {
  return (
    `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
      <path d="M387.07,172.13h-42.4c-4.94,0-9.64-2.12-12.91-5.81l-17.2-19.43c-2.56-2.9-6.25-4.55-10.11-4.55s-7.55,1.66-10.11,4.55l-14.75,16.67c-4.83,5.45-11.76,8.58-19.04,8.58H28.46c-6.61,18.84-10.92,38.74-12.64,59.38H234.92c3.85,0,7.54-1.57,10.2-4.35l20.4-21.29c2.55-2.66,6.07-4.16,9.75-4.16h.84c3.87,0,7.55,1.66,10.11,4.56l17.19,19.43c3.27,3.7,7.97,5.81,12.91,5.81h178.84c-1.72-20.65-6.03-40.55-12.64-59.38h-95.46Z"/>
      <path d="M148.4,356.39c3.85,0,7.54-1.57,10.2-4.35l20.4-21.29c2.55-2.66,6.07-4.16,9.75-4.16h.84c3.87,0,7.55,1.66,10.11,4.55l17.19,19.43c3.27,3.7,7.97,5.81,12.91,5.81h242.36c9.08-18.76,15.73-38.89,19.69-59.98h-232.63c-4.94,0-9.64-2.12-12.91-5.81l-17.19-19.43c-2.56-2.9-6.25-4.55-10.11-4.55s-7.55,1.66-10.11,4.55l-14.75,16.67c-4.83,5.45-11.76,8.58-19.05,8.58H19.12c3.96,21.09,10.62,41.22,19.69,59.98h109.59Z"/>
      <path d="M320.34,107.24c3.85,0,7.54-1.57,10.2-4.35l20.4-21.29c2.55-2.66,6.07-4.16,9.75-4.16h.84c3.87,0,7.55,1.66,10.11,4.56l17.19,19.43c3.27,3.7,7.97,5.81,12.91,5.81h46.09C403.94,48.9,334.13,11.16,255.49,11.16S107.04,48.9,63.15,107.24H320.34Z"/>
      <path d="M227.77,415.83h-63.03c-4.94,0-9.64-2.12-12.91-5.81l-17.19-19.43c-2.56-2.9-6.25-4.55-10.11-4.55s-7.55,1.66-10.11,4.55l-14.75,16.67c-4.83,5.45-11.76,8.58-19.05,8.58h-.98c43.91,47.05,106.44,76.5,175.87,76.5s131.95-29.45,175.87-76.5H227.77Z"/>
  </svg>
    `
  );
}

function imgToCanvas(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvas;
}

async function resizeImage(base64image: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.src = base64image;

    let base64ResizedImage: string = base64image;

    img.onload = () => {
      // Check if the image require resize at all
      if (img.height <= height && img.width <= width) {
        return resolve(base64ResizedImage);
      } else {
        // Make sure the width and height preserve the original aspect ratio and adjust if needed
        if (img.height > img.width) {
          width = Math.floor(height * (img.width / img.height));
        } else {
          height = Math.floor(width * (img.height / img.width));
        }

        let resizingCanvas: HTMLCanvasElement = document.createElement("canvas");
        let resizingCanvasContext = resizingCanvas.getContext("2d")!;

        // Start with original image size
        resizingCanvas.width = img.width;
        resizingCanvas.height = img.height;

        // Draw the original image on the (temp) resizing canvas
        resizingCanvasContext.clearRect(0, 0, resizingCanvas.width, resizingCanvas.height);
        resizingCanvasContext.drawImage(img, 0, 0, resizingCanvas.width, resizingCanvas.height);

        let curImageDimensions = {
          width: Math.floor(img.width),
          height: Math.floor(img.height)
        };

        let halfImageDimensions: { width: number, height: number };

        // Quickly reduce the dize by 50% each time in few iterations until the size is less then
        // 2x time the target size - the motivation for it, is to reduce the aliasing that would have been
        // created with direct reduction of very big image to small image
        while (curImageDimensions.width * 0.5 > width) {
          // Reduce the resizing canvas by half and refresh the image
          halfImageDimensions = {
            width: Math.floor(curImageDimensions.width * 0.5),
            height: Math.floor(curImageDimensions.height * 0.5)
          };

          let newCanvas: HTMLCanvasElement = document.createElement("canvas");
          newCanvas.width = halfImageDimensions.width;
          newCanvas.height = halfImageDimensions.height;
          let newCanvasContext = newCanvas.getContext("2d")!;
          newCanvasContext.clearRect(0, 0, newCanvas.width, newCanvas.height);

          newCanvasContext.drawImage(resizingCanvas, 0, 0, curImageDimensions.width, curImageDimensions.height,
            0, 0, halfImageDimensions.width, halfImageDimensions.height);

          resizingCanvas = newCanvas;

          curImageDimensions.width = halfImageDimensions.width;
          curImageDimensions.height = halfImageDimensions.height;
        }

        // Now do final resize for the resizingCanvas to meet the dimension requirments
        // directly to the output canvas, that will output the final image
        let outputCanvas: HTMLCanvasElement = document.createElement("canvas");
        outputCanvas.width = width;
        outputCanvas.height = height;
        let outputCanvasContext = outputCanvas.getContext("2d")!;

        outputCanvasContext.drawImage(resizingCanvas, 0, 0, curImageDimensions.width, curImageDimensions.height,
          0, 0, width, height);

        return resolve(outputCanvas.toDataURL("image/png"));
      }
    };
  });
}

function ditherize(ctx: CanvasRenderingContext2D) {
  /*const palette = [
    { "hex": "#000000" },
    { "hex": "#ffffff" },
    { "hex": "#009efd" },
    { "hex": "#00c503" },
    { "hex": "#ffc600" },
    { "hex": "#ff7d00" },
    { "hex": "#fa006a" },
    { "hex": "#c400c7" }
  ];*/

  const palette = [
    [0, 0, 0],
    [255, 255, 255],
    [0, 158, 253],
    [0, 197, 3],
    [255, 198, 0],
    [255, 125, 0],
    [250, 0, 106],
    [196, 0, 199],
  ];

  const rgbQuantOptions = {
    method: 2, // histogram method, 2: min-population threshold within subregions; 1: global top-population
    boxSize: [8, 8], // subregion dims (if method = 2)
    boxPxls: 2, // min-population threshold (if method = 2)
    initColors: 4096, // # of top-occurring colors to start with (if method = 1)
    minHueCols: 2000, // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
    dithKern: "FloydSteinberg", // dithering kernel name, see available kernels in docs below
    /*
    Options:
       'FloydSteinberg',
       'FalseFloydSteinberg',
       'Stucki',
       'Atkinson',
       'Jarvis',
       'Burkes',
       'Sierra',
       'TwoSierra',
       'SierraLite'
     */
    dithDelta: 0, // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
    dithSerp: false, // enable serpentine pattern dithering
    reIndex: false, // affects predefined palettes only. if true, allows compacting of sparsed palette once target
                    // palette hsize is reaced. also enables palette sorting.
    useCache: true, // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
    cacheFreq: 10, // min color occurance count needed to qualify for caching
    colorDist: "euclidean", // method used to determine color distance, can also be "manhattan"
    colors: palette.length, // desired palette size
    palette, // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
  };
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const z = RgbQuant;

  const newCanvas = document.createElement("canvas");
  newCanvas.height = height;
  newCanvas.width = width;
  const newCtx = newCanvas.getContext("2d")!;

  const q = new RgbQuant(rgbQuantOptions);
  // Analyze histograms to get colors
  q.sample(ctx.canvas);
  const ditherResult = q.reduce(ctx);
  // Get the newly dithered image data
  const imgData = newCtx.getImageData(0, 0, width, height);
  console.log(newCtx.canvas.width, newCtx.canvas.height, imgData.width, imgData.height, ctx.canvas.width,
    ctx.canvas.height);
  // Set the value of imageData to the dithered image data
  imgData.data.set(ditherResult);
  newCtx.putImageData(imgData, 0, 0);
  return newCanvas;
}

async function renderAndDither(imageString: string, id: string, width: number, height: number) {
  const imgData = await resizeImage(imageString, width, height);
  let img = new Image();
  img.src = imgData;
  img.onload = () => {
    const outputImg = document.getElementById(id) as HTMLImageElement;
    const canvas = imgToCanvas(img);
    outputImg.src = ditherize(canvas.getContext("2d")!).toDataURL("image/png");
    //outputImg.src = imgData;//canvas.toDataURL("image/png");
    outputImg.width = width;
    outputImg.height = height;
  };
}

const SvgToPngComponent: React.FC<{ clickCache: any }> = ({ clickCache }) => {

  const id = `canvas_${Math.floor(Math.random() * 100000)}`;
  const imgId = `img${id}`;

  useEffect(() => {

    (async () => {
      // Load SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(aptosSVG(), "image/svg+xml");

      // Modify SVG
      const paths = svgDoc.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("fill", "url(#rainbowGradient)");
        path.setAttribute("stroke", "url(#rainbowGradient)");
      });

      // Generate random colors
      const generator = new GoldenNumberGenerator();
      const randomColor = () => `hsl(${Math.round(generator.next() * 360)}, 83%, 71%)`;

      const randomAngle = Math.random() * 360; // Angle in degrees
      const x1 = parseFloat(Math.cos(randomAngle * Math.PI / 180).toFixed(2));
      const y1 = parseFloat(Math.sin(randomAngle * Math.PI / 180).toFixed(2));

      const numStops = Math.floor(Math.random() * 2) + 2; // Between 3 and 7 stops
      let stops = "";
      for (let i = 0; i < numStops; i++) {
        const percentOffset = (i / (numStops - 1)) * 100;
        stops += `<stop offset="${percentOffset}%" stop-color="${randomColor()}"/>`;
      }

      const svgRoot = svgDoc.querySelector("svg")!;

      // Add random gradient definition to SVG
      const gradient = `
    <defs>
      <linearGradient id="rainbowGradient" x1="${x1}" y1="${y1}" x2="100%" y2="100%">
        ${stops}
      </linearGradient>
    </defs>`;
      svgRoot.innerHTML += gradient;

      // Give it a random rotation from -30* to 30*
      const randomRotation = (Math.random() * 60) - 30;
      // Generate random scale factor between 0.7 and 1
      const randomScale = 0.7 + Math.random() * 0.2;
      svgRoot.setAttribute("transform", `rotate(${randomRotation}) scale(${randomScale})`);


      // Draw SVG onto Canvas
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.src = "data:image/svg+xml," + encodeURIComponent(
        new XMLSerializer().serializeToString(svgDoc.documentElement));
      img.onload = () => {
        (async () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageString = ctx.canvas.toDataURL("image/png");

          renderAndDither(imageString, imgId, 20, 20);
          renderAndDither(imageString, imgId + "2", 50, 50);
          renderAndDither(imageString, imgId + "3", 100, 100);
          renderAndDither(imageString, imgId + "4", 200, 200);

          // Now pngData contains the PNG image data
        })();
      };
    })();
  }, [clickCache]);

  return (
    <div>
      <canvas id={id} width="400" height="400"></canvas>
      <div>
        <img style={{ margin: "5px" }} id={imgId} alt="Generated PNG"/>
        <img style={{ margin: "5px" }} id={imgId + "2"} alt="Generated PNG"/>
        <img style={{ margin: "5px" }} id={imgId + "3"} alt="Generated PNG"/>
        <img style={{ margin: "5px" }} id={imgId + "4"} alt="Generated PNG"/>
      </div>
    </div>
  );
};

function App() {
  const [clickCache, setclickCache] = useState(0);

  function handleClick() {
    setclickCache(clickCache + 1);
  }


  return (
    <div className="App">
      <header className="App-header">
        <button onClick={handleClick} style={{ padding: "10px", margin: "10px" }}>Refresh</button>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ border: "1px solid gray", margin: "auto", marginRight: "20px" }}>
            <SvgToPngComponent clickCache={clickCache}/>
          </div>
          <div style={{ border: "1px solid gray", margin: "auto", backgroundColor: "black" }}>
            <SvgToPngComponent clickCache={clickCache}/>
          </div>
        </div>

      </header>
    </div>
  );
}

export default App;
