import { NextRequest, NextResponse } from "next/server";
import iconv from "iconv-lite";

export const runtime = "nodejs";

/**
 * NOTE:
 * This endpoint used to call OpenAI Images API.
 * It now only builds the prompt and returns it as a downloadable text file.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const message = searchParams.get("message") ?? "";
    const keyword = searchParams.get("keyword") ?? "";

    const text =
      message.trim().length > 0 ? message.trim() : "PayPay銀行へ入金よろしく";
    const theme =
      keyword.trim().length > 0 ? keyword.trim() : "麦色の毛の猫";

    const isMochi = /餅|もち|mochi/i.test(theme);
    const mochiConstraints: string[] = isMochi
      ? [
          "For a mochi (rice cake) character: render the body as pure opaque white, soft and slightly squishy, smooth with a subtle powdery texture.",
          "ABSOLUTE: Paint the mochi boy's entire body AND head with pure white (#FFFFFF) in fully opaque color (alpha=255). Never leave any holes or see-through areas.",
          "No stripes, no banding, no wrappers, no plates, no packaging, and no toppings/fillings unless explicitly requested.",
          "Keep the body shape as a simple rounded mochi blob. Shading must be very subtle (no large gray panels).",
        ]
      : [];

    const angles = [
      "front view",
      "three-quarter view (left)",
      "three-quarter view (right)",
      "profile view (left)",
      "profile view (right)",
      "rear three-quarter view",
      "back view (the character turns head to look at the camera)",
      "top-down view (bird's-eye)",
      "low angle from below (worm's-eye)",
      "high angle from above",
      "from directly above",
      "from directly below",
    ] as const;

    const angle = angles[Math.floor(Math.random() * angles.length)];

    const textPlacements = [
      "at the top",
      "at the bottom",
      "diagonally from top-left to bottom-right",
      "diagonally from top-right to bottom-left",
    ] as const;

    const characterPlacements = [
      "centered",
      "on the left side",
      "on the right side",
    ] as const;

    const cameraDistances = [
      "extreme close-up",
      "close-up",
      "half-body",
      "full-body",
    ] as const;

    const textPlacement =
      textPlacements[Math.floor(Math.random() * textPlacements.length)];
    const characterPlacement =
      characterPlacements[Math.floor(Math.random() * characterPlacements.length)];
    const cameraDistance =
      cameraDistances[Math.floor(Math.random() * cameraDistances.length)];

    const contextIsolationBlock = [
      "CONTEXT ISOLATION (HIGHEST PRIORITY):",
      "This request is fully standalone. Use ONLY the instructions in this prompt.",
      "Ignore any prior conversation, prior images, prior attempts, and any external context.",
      "Do not reference, continue, or stay consistent with any previous outputs.",
      "Create a fresh, independent sticker design that does NOT resemble any prior result unless explicitly described here.",
    ].join("\n");

    const frontPrompt = [
      "Generate a single LINE-style Japanese sticker illustration.",
      "Overall style: soft, cute, chibi-style character illustration.",
      "Rendering style lock: clean, crisp lineart and smooth shading for a sticker-style finish.",
      "NO watercolor, NO textured paper, NO grain, NO crayon/pastel, NO faded/washed-out look.",
      "Keep edges sharp and colors solid (fully opaque).",
      "Do not make the illustration small and centered. Use the 1024x1024 canvas broadly and fill the available area.",
      "Make the text as large as possible while keeping it fully readable.",
      "TEXT RULES (STRICT): The ONLY text allowed in the entire image is the provided message.",
      "Do NOT add any other text characters anywhere: no extra Japanese, no extra English letters, no random glyphs, and no extra numbers beyond what already appears in the message. Do NOT add any extra punctuation characters beyond what appears in the message.",
      "No sound effects, no captions, no background writing, no watermark, no signature, and no UI text.",
      "If any extra text or characters appear, the result is incorrect.",
      "The character (body, face, clothes, accessories) must be painted with solid, fully opaque colors.",
      "Do NOT make the character translucent or see-through: no glass, jelly, clear, ghost, watery, or low-opacity effects.",
      "If the character theme implies mochi/rice cake, still render it as fully opaque (no refraction, no see-through look).",
      "Only the background is transparent. The character and text must be fully opaque with no transparency holes.",
      "Make the character's reaction VERY exaggerated and over-the-top (big facial expression, big mouth, bold eyebrows, sweat drops/tears, motion lines).",
      "The text and the character must not be transparent. Only the background is transparent.",
      "The area inside the outline must not be transparent.",
      'ABSOLUTE: If the theme is "らむちゃん", NEVER draw any horns/antennae (no horns at all).',
      "ABSOLUTE RULE (NO EXCEPTIONS): The character, the text, and the white sticker backing must NEVER contain transparency. Alpha must be 255 (fully opaque) everywhere inside the sticker area.",
      "Even if the character is pure white on a pure white sticker backing, keep it fully opaque and separate edges with a thin light-gray outline and/or a tiny soft shadow (both fully opaque). Do NOT erase white parts.",
      "Never use transparency for highlights, shading, glow, or sparkles on the character/text; render all effects as opaque colors.",
      "",
      "Character reference glossary (for interpreting the keyword/theme):",
      "? 『僕』: a cute chibi boy character whose body IS mochi (Japanese rice cake). Mochi is made from pounded glutinous rice and looks like a smooth, soft, slightly squishy, fully opaque white mass (NOT transparent). Keep it simple and rounded, like a mochi blob.",
      "? 『らむちゃん』: An ORIGINAL chibi woman character and MUST look NOTHING like any existing anime/manga character.",
      "  - NOT based on any existing anime/manga. Must NOT resemble any copyrighted/trademarked character in face, hair, outfit, accessories, or overall vibe.",
      "  - Age: 23. Gender: woman. Slightly chubby.",
      "  - Hair: brown with red mesh highlights.",
      "  - 『むぎちゃん』's owner; she adores and spoils 『むぎちゃん』. She works nights (adult/night job), but keep depiction non-explicit and wholesome: no nudity, no lingerie, no sexual content.",
      "? 『むぎちゃん』: a 7-month-old female cat/kitten with LIGHT wheat-colored fur (light wheat-colored fur), pale golden-beige. (NOT chestnut.)",
      "IMPORTANT: Do not depict, imitate, or reference any third-party copyrighted/trademarked characters, logos, brands, or recognizable IP. All characters and designs must be original.",
      "Do not include URLs, release announcements, or calls-to-action in the artwork text.",
      "Keep the sticker appropriate for general audiences: no nudity, no explicit sexual content, no extreme violence, no self-harm, no illegal drugs, and no hate/harassment.",
      "",
      "CRITICAL: Render the message EXACTLY as provided, character-for-character.",
      "No typos, no missing characters, no extra characters, no substitutions, and no paraphrasing.",
      "Prioritize text correctness over decoration. If needed, reduce sparkles/ornaments but keep the characters exact.",
      "SPECIAL CASE (HIGH PRIORITY): If the requested sticker text is exactly \"poi-!poi-!\", be extremely careful and render it PERFECTLY as \"poi-!poi-!\" (same letters, hyphen, and exclamation marks). Double-check for typos, missing symbols, or extra spaces.",
      "Make the text very large, thick, and bold so it stands out like a sticker.",
      "Give the text a strong outline and a slight 3D feeling so it remains easy to read even at small size.",
      "Make the text very flashy and sparkling in a 'kira-kira' LINE sticker style: use bright colors, thick colored outlines, soft neon-like glow, glitter-like sparkles, and small star or heart decorations around the letters.",
      "However, never sacrifice legibility: do not cover, distort, or break the shapes of any characters, and keep every character clearly readable even when the sticker is small.",
      "Keep the lettering rounded and friendly, like pop-style comic handwriting.",
      "",
      "Create a solid white sticker backing: cut out the combined silhouette of the character and the text, and fill that silhouette with pure white (fully opaque).",
      "When filling with pure white (fully opaque), carefully consider transparency vs opacity and make sure the filled area is truly opaque (no accidental transparency).",
      "Everything outside this white sticker backing must be fully transparent (alpha channel).",
      "Do not add any other background elements such as panels, gradients, or patterns beyond the white sticker backing. Motion lines and sparkle decorations are allowed as part of the sticker art, as long as everything stays inside the white sticker backing and remains fully opaque.",
      "Ensure the entire character and the text are filled and fully opaque (no accidental transparency holes). You may anti-alias only the outer edges; the interior must remain opaque.",
    ].join("\n");

    const layoutBlock = [
      "COMPOSITION VARIATION (REQUIRED):",
      `Random layout for this image: text ${textPlacement}; character ${characterPlacement}; camera distance ${cameraDistance}.`,
      "Vary the overall layout each generation. Do NOT reuse a previous layout.",
    ].join("\n");

    const free360Block = [
      "OVERRIDE ORIENTATION: Ignore any earlier fixed front/right view constraints.",
      "Camera angle is FREE 360° and must be RANDOM each generation.",
      `Random camera angle for this image: ${angle}.`,
      "The camera may be above, below, behind, or any direction around the subject.",
      "However, the character's eyes/gaze must look directly at the camera (the viewer).",
      "If the camera is behind/above/below, rotate the head/pose so the face is still visible and maintaining eye contact.",
    ].join("\n");

    const variableBlock = [
      `Character theme: "${theme}".`,
      ...mochiConstraints,
      "",
      `Include the message "${text}" inside the illustration as part of the artwork.`,
    ].join("\n");

    const prompt = [contextIsolationBlock, frontPrompt, layoutBlock, free360Block, variableBlock]
      .filter(Boolean)
      .join("\n\n");

    // Return as a downloadable Shift_JIS (CP932) encoded text file.
    const sjisBuf = iconv.encode(prompt, "cp932");

    return new NextResponse(sjisBuf, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=shift_jis",
        "Content-Disposition": 'attachment; filename="prompt.txt"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to build prompt." },
      { status: 500 }
    );
  }
}
