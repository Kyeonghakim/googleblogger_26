import { test, expect, describe } from "bun:test";
import { insertImagesIntoContent } from "./images";
import type { ImageResult } from "./images";

describe("insertImagesIntoContent", () => {
  const mockImages: ImageResult[] = [
    { url: "https://img1.jpg", alt: "Image 1", photographer: "Alice", photographerUrl: "https://unsplash.com/@alice" },
    { url: "https://img2.jpg", alt: "Image 2", photographer: "Bob", photographerUrl: "https://unsplash.com/@bob" },
    { url: "https://img3.jpg", alt: "Image 3", photographer: "Charlie", photographerUrl: "https://unsplash.com/@charlie" },
  ];

  test("should not break HTML tags when inserting multiple images into paragraphs", () => {
    const htmlContent = `
<p>Paragraph 1</p>
<p>Paragraph 2</p>
<p>Paragraph 3</p>
<p>Paragraph 4</p>
<p>Paragraph 5</p>
<p>Paragraph 6</p>
<p>Paragraph 7</p>
<p>Paragraph 8</p>
<p>Paragraph 9</p>
`;

    const result = insertImagesIntoContent(htmlContent, mockImages);

    const figcaptionCount = (result.match(/<figcaption/g) || []).length;
    const closingFigcaptionCount = (result.match(/<\/figcaption>/g) || []).length;
    expect(figcaptionCount).toBe(closingFigcaptionCount);
    
    const figureCount = (result.match(/<figure/g) || []).length;
    const closingFigureCount = (result.match(/<\/figure>/g) || []).length;
    expect(figureCount).toBe(closingFigureCount);

    expect(result).not.toMatch(/^ion style=/m);
    expect(result).not.toMatch(/^\s*\.5em;">/m);
    expect(result).not.toMatch(/^\s*margin-top:/m);
    expect(result).not.toMatch(/^\s*font-size:/m);
  });

  test("should insert images before h2 tags when available", () => {
    const htmlContent = `
<h2>Section 1</h2>
<p>Content 1</p>
<h2>Section 2</h2>
<p>Content 2</p>
<h2>Section 3</h2>
<p>Content 3</p>
`;

    const result = insertImagesIntoContent(htmlContent, mockImages);

    expect(result).toContain('<figure');
    expect(result).toContain('</figure>');
    expect(result).toContain('<figcaption');
    expect(result).toContain('</figcaption>');
  });

  test("should preserve all original paragraph content", () => {
    const htmlContent = `
<p>First paragraph with important content.</p>
<p>Second paragraph here.</p>
<p>Third paragraph text.</p>
<p>Fourth paragraph data.</p>
<p>Fifth paragraph info.</p>
<p>Sixth paragraph details.</p>
`;

    const result = insertImagesIntoContent(htmlContent, mockImages);

    expect(result).toContain('First paragraph with important content.');
    expect(result).toContain('Second paragraph here.');
    expect(result).toContain('Third paragraph text.');
    expect(result).toContain('Fourth paragraph data.');
    expect(result).toContain('Fifth paragraph info.');
    expect(result).toContain('Sixth paragraph details.');
  });

  test("should have valid HTML structure after multiple insertions", () => {
    const htmlContent = Array(12).fill(0).map((_, i) => `<p>Paragraph ${i + 1}</p>`).join('\n');

    const result = insertImagesIntoContent(htmlContent, mockImages);

    const openP = (result.match(/<p>/g) || []).length;
    const closeP = (result.match(/<\/p>/g) || []).length;
    expect(openP).toBe(closeP);

    expect(result).not.toMatch(/style="[^"]*style="/);
    expect(result).not.toMatch(/<[a-z]+[^>]*<[a-z]+/i);
  });
});
