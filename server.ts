import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let currentFilename = "";
try {
  if (typeof import.meta !== "undefined" && import.meta.url) {
    currentFilename = fileURLToPath(import.meta.url);
  } else {
    currentFilename = typeof __filename !== "undefined" ? __filename : "";
  }
} catch (e) {
  currentFilename = typeof __filename !== "undefined" ? __filename : "";
}
const __dirname = path.dirname(currentFilename || ".");

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware for parsing requests (including larger payloads for base64 images)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize Gemini API
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API successfully initialized on server.");
  } catch (error) {
    console.error("Error initializing Gemini API:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found or using placeholder. Running in simulated AI mode.");
}

// Fallback rule-based analyzer for environments without a valid Gemini key
function getSimulatedAnalysis(description: string, imageUrl?: string) {
  const descLower = description.toLowerCase();
  let category: string = "other";
  let title: string = "Reported Community Issue";
  let severity: string = "medium";
  let suggestedAgency: string = "City General Maintenance Department";
  let actionSteps: string[] = [
    "Verify the reported location coordinates.",
    "Log report into the citizen work-order queue.",
    "Dispatch inspection crew to assess required equipment."
  ];

  if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("asphalt") || descLower.includes("street")) {
    category = "pothole";
    title = "Street Pavement Repair Request";
    severity = descLower.includes("deep") || descLower.includes("large") ? "high" : "medium";
    suggestedAgency = "Department of Transportation (Pavement Division)";
    actionSteps = [
      "Set up safety cones or temporary hazard warnings near the pothole.",
      "Dispatch a repair crew with hot-mix asphalt patching material.",
      "Inspect adjacent road surface for progressive structural cracking."
    ];
  } else if (descLower.includes("graffiti") || descLower.includes("tagging") || descLower.includes("paint") || descLower.includes("vandalism")) {
    category = "graffiti";
    title = "Graffiti & Vandalism Removal";
    severity = "low";
    suggestedAgency = "Public Works (Anti-Graffiti & Beautification Team)";
    actionSteps = [
      "Inspect property boundaries to identify public vs. private cleaning responsibility.",
      "Select appropriate solvent or paint matching code based on surface substrate.",
      "Apply anti-graffiti protective coat to prevent future adherence."
    ];
  } else if (descLower.includes("light") || descLower.includes("dark") || descLower.includes("lamp") || descLower.includes("streetlight") || descLower.includes("bulb")) {
    category = "broken_light";
    title = "Streetlight Outage / Electrical Issue";
    severity = descLower.includes("intersection") || descLower.includes("crosswalk") ? "high" : "medium";
    suggestedAgency = "Municipal Utilities Board (Electrical Division)";
    actionSteps = [
      "De-energize the lamp post to ensure safe repair conditions.",
      "Replace bulb with energy-efficient LED and check local photocell function.",
      "Check underground wiring circuits for load integrity and ground faults."
    ];
  } else if (descLower.includes("leak") || descLower.includes("water") || descLower.includes("pipe") || descLower.includes("burst") || descLower.includes("flooding")) {
    category = "water_leak";
    title = "Water Line / Main Pipe Leak Reporting";
    severity = descLower.includes("gushing") || descLower.includes("burst") || descLower.includes("flood") ? "critical" : "high";
    suggestedAgency = "City Water & Sewer Utility Agency";
    actionSteps = [
      "Isolate the local water distribution valve to stop ongoing pressure loss.",
      "Excavate the area to expose the damaged piping section.",
      "Replace damaged water line joints, flush the line, and test pressure."
    ];
  } else if (descLower.includes("trash") || descLower.includes("garbage") || descLower.includes("litter") || descLower.includes("dumping") || descLower.includes("waste")) {
    category = "trash";
    title = "Illegal Dumping / Trash Collection Issue";
    severity = descLower.includes("blocking") || descLower.includes("hazard") ? "medium" : "low";
    suggestedAgency = "Sanitation & Solid Waste Management";
    actionSteps = [
      "Dispatch sanitation vehicle to clear bulk items and general refuse.",
      "Assess debris for hazardous materials or electronic waste requiring special disposal.",
      "Post 'No Dumping' signage or investigate tags for source tracing."
    ];
  } else if (descLower.includes("danger") || descLower.includes("safety") || descLower.includes("wires") || descLower.includes("collapsed") || descLower.includes("hazard")) {
    category = "safety";
    title = "Immediate Public Safety Hazard";
    severity = "critical";
    suggestedAgency = "Emergency Management & Public Safety Dispatch";
    actionSteps = [
      "Immediately cord off the area with high-visibility barrier tape.",
      "Coordinate with local police or emergency responders for traffic control.",
      "Deploy specialized emergency contractors to mitigate structural or physical threats."
    ];
  }

  // Add standard image note
  let summary = `Our rules-based analysis has classified this as a "${category}" issue with "${severity}" priority. ${imageUrl ? "We have processed the uploaded image to support verification." : "Please consider adding an image for faster verification."} City crew has been notified and routed to ${suggestedAgency}.`;
 
  return {
    title,
    category,
    severity,
    suggestedAgency,
    summary,
    actionSteps,
    simulated: true
  };
}

// API endpoint to analyze reported issue using Gemini
app.post("/api/analyze-issue", async (req, res) => {
  const { description, location, imageBase64 } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required for issue analysis." });
  }

  // If Gemini client is not initialized, fallback to simulated analysis
  if (!ai) {
    const simulation = getSimulatedAnalysis(description, imageBase64);
    return res.json(simulation);
  }

  try {
    const contents: any[] = [];
    
    // Construct the prompt guiding the AI to behave as a civic engineering analyst
    const promptText = `
You are CityFix-AI, a professional municipal engineering and public works assistant.
Analyze the following community issue report and provide a structured classification.

User Description: "${description}"
Reported Location Context: "${location || "Not specified"}"

Your goal is to parse this report, categorize it, assess its severity, suggest the responsible municipal agency, and summarize next steps.

Categorize the issue strictly into one of the following category keys:
- 'pothole': Road damage, asphalt cracks, potholes, street cracks.
- 'graffiti': Graffiti, unauthorized paintings, tags on public/private property.
- 'broken_light': Streetlights out, flashing traffic signals, dark public pathways.
- 'water_leak': Burst water mains, leaking fire hydrants, street flooding.
- 'trash': Overflowing public trash cans, illegal bulk dumping, heavy litter.
- 'safety': Exposed electrical wires, falling tree limbs blocking roads, structure collapses.
- 'other': Any other issue that doesn't fit the above categories.

Assess the severity level strictly into one of:
- 'low': Minor annoyance, no safety risk (e.g. slight graffiti, small litter).
- 'medium': General issue, needs fixing soon (e.g. standard potholes, standard streetlight outages).
- 'high': Disrupted services or minor physical risks (e.g. large pothole on fast road, major water leaks, broken light near dangerous intersection).
- 'critical': Immediate danger to life or infrastructure damage (e.g. gushing water flooding street, exposed live cables, collapsing structures).

Generate:
1. A concise, professional title for the issue.
2. The classified category.
3. The classified severity.
4. A highly specific local public department/agency name to resolve this.
5. A polite, beautifully formatted summary explaining the categorization, estimated impacts, and assurance to the reporter.
6. A set of 3 to 4 actionable, concrete next steps of what the city/crew will do.
`;

    contents.push({ text: promptText });

    // Include the base64 image if it was uploaded
    if (imageBase64) {
      // Expect format: "data:image/png;base64,iVBOR..." or just raw base64. Parse mime and data.
      let mimeType = "image/jpeg";
      let base64Data = imageBase64;
      
      const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contents },
      config: {
        systemInstruction: "You are an expert municipal system auditor. Respond with precise, helpful, and community-oriented civic data.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise, clear title for the reported issue based on details (max 6 words)" },
            category: { type: Type.STRING, description: "The issue category: 'pothole', 'graffiti', 'broken_light', 'water_leak', 'trash', 'safety', or 'other'" },
            severity: { type: Type.STRING, description: "The severity level: 'low', 'medium', 'high', or 'critical'" },
            suggestedAgency: { type: Type.STRING, description: "The city department or agency responsible for fixing this" },
            summary: { type: Type.STRING, description: "A polite, comprehensive civic analysis summarizing the problem and why it is categorized/prioritized this way." },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 actionable next steps the city or reporter can take"
            }
          },
          required: ["title", "category", "severity", "suggestedAgency", "summary", "actionSteps"]
        }
      }
    });

    if (response.text) {
      const parsedData = JSON.parse(response.text.trim());
      return res.json({
        ...parsedData,
        simulated: false
      });
    } else {
      throw new Error("Empty response text from Gemini.");
    }

  } catch (error) {
    console.error("Gemini processing error:", error);
    // Graceful fallback if Gemini API error occurs
    const simulation = getSimulatedAnalysis(description, imageBase64);
    return res.json({
      ...simulation,
      errorOccurred: true,
      errorMsg: error instanceof Error ? error.message : "AI processing failed"
    });
  }
});

// API endpoint to reverse geocode lat/lng using Google Maps Geocoding API
app.post("/api/reverse-geocode", async (req, res) => {
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }

  // Fallback simulation helper
  const getMockAddress = () => {
    // Standard mock location in Rohini Sector 8, Delhi or generic Delhi depending on coords
    if (lat > 28 && lat < 29 && lng > 76 && lng < 78) {
      return "Rohini Sector 8, Delhi, 110085, India";
    }
    return "Rohini Sector 8, Delhi, 110085, India";
  };

  const gmapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;
  if (!gmapsKey || gmapsKey === "YOUR_API_KEY") {
    // Simulate API delay for realistic visual loading
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ address: getMockAddress(), simulated: true });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${gmapsKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding server returned status ${response.status}`);
    }
    const data = await response.json();
    if (data.status === "OK" && data.results && data.results[0]) {
      return res.json({
        address: data.results[0].formatted_address,
        simulated: false
      });
    } else {
      console.warn("Geocoding API status not OK:", data.status);
      return res.json({
        address: getMockAddress(),
        simulated: true,
        apiStatus: data.status
      });
    }
  } catch (error) {
    console.error("Geocoding API proxy error:", error);
    return res.json({
      address: getMockAddress(),
      simulated: true,
      errorOccurred: true
    });
  }
});

// Configure Vite or Static Assets based on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production mode - serving compiled build
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CityFix Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
