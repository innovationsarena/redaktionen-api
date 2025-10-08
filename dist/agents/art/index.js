"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.artDirector = void 0;
const ai_1 = require("ai");
const openai_1 = require("@ai-sdk/openai");
const services_1 = require("../../services");
const zod_1 = __importDefault(require("zod"));
const sharp_1 = __importDefault(require("sharp"));
const artDirector = async (summary, style) => {
    console.log(`Art director creating poster image to ${summary.title} summary.`);
    const system = `You are an image-generation assistant. For each user input , extract 2-3 concise symbolic keywords and produce a single short photorealistic poster prompt. Output only the final prompt (one line), replacing {summary_keywords} with the chosen keywords; do not add explanations.

Prompt requirements:
- Style: Photorealistic, vibrant pastel palette.
- Background: Solid grey #eeeeee.
- Subject: 2-3 symbolic objects representing {summary_keywords}, arranged centrally, slightly floating with subtle shadows.
- People: No human faces or identifiable people.
- No logos, no on-image text.
- Lighting/composition: Soft natural lighting, high detail, shallow depth of field, cinematic composition, ample negative space at top-center for a headline.
- Orientation: Horizontal poster (16:9 aspect ratio).

Output: 
The output should be a complete prompt that will be directly prompted to an image model.
`;
    const prompt = `Create a poster image that represents this article: 
  title: ${summary.title}
  body: ${summary.body}`;
    try {
        // Art prompt
        const { object: { imagePrompt }, } = await (0, ai_1.generateObject)({
            model: (0, openai_1.openai)(process.env.ARTDIRECTOR_DEFAULT_MODEL || "gpt-5-mini"),
            system,
            prompt,
            schema: zod_1.default.object({ imagePrompt: zod_1.default.string() }),
        });
        // Create Image
        const { image } = await (0, ai_1.experimental_generateImage)({
            model: openai_1.openai.image(process.env.DEFAULT_IMAGE_MODEL || "gpt-image-1-mini"),
            prompt: imagePrompt,
        });
        // Store Image
        const url = await createImageFromBase64(image.base64);
        // Update summary with public URL
        await services_1.summaries.update({ ...summary, posterUrl: url });
        return;
    }
    catch (error) {
        console.log(error);
    }
};
exports.artDirector = artDirector;
async function createImageFromBase64(base64) {
    const imgBuffer = Buffer.from(base64, "base64");
    // Convert to JPG with sharp
    const jpgBuffer = await (0, sharp_1.default)(imgBuffer)
        .resize(1024, null)
        .toFormat("jpg", { quality: 60 })
        .toBuffer();
    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.jpg`;
    // Upload to Supabase storage
    const { data, error } = await services_1.supabase.storage
        .from("images")
        .upload(fileName, jpgBuffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
    });
    if (error)
        throw new Error(`Failed to upload image: ${error.message}`);
    // Get public URL
    const { data: publicUrlData } = services_1.supabase.storage
        .from("images")
        .getPublicUrl(fileName);
    return publicUrlData.publicUrl;
}
