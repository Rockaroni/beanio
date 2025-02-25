import { GenerativeModel } from '@google-ai/generativelanguage';

// This is a placeholder for your actual API key
// You should store this securely, preferably using environment variables
const API_KEY = 'YOUR_GEMINI_API_KEY';

// Initialize the Gemini model
const geminiModel = new GenerativeModel({
  model: 'gemini-pro-vision',
  apiKey: API_KEY,
});

/**
 * Analyzes a coffee bean bag image using Google Gemini Vision AI
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Promise<Object>} - Coffee bean information
 */
export const analyzeCoffeeBeanImage = async (imageBase64) => {
  try {
    // Create the prompt for Gemini
    const prompt = `
      Analyze this coffee bean bag image and extract the following information:
      1. Coffee Bean Name
      2. Roaster Name
      3. Seller (if different from roaster)
      4. Price (if visible)
      5. Origin of beans
      6. Roast level (light, medium, dark, etc.)
      7. Flavor notes
      8. Processing method (if mentioned)
      9. Any special certifications (organic, fair trade, etc.)
      
      Format the response as a JSON object with these fields.
      If any information is not visible or cannot be determined, use null for that field.
    `;

    // Call the Gemini API with the image
    const result = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]
        }
      ]
    });

    // Parse the response
    const responseText = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\\{.*\\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, create a structured response
    return {
      beanName: extractField(responseText, 'Coffee Bean Name'),
      roaster: extractField(responseText, 'Roaster Name'),
      seller: extractField(responseText, 'Seller'),
      price: extractField(responseText, 'Price'),
      origin: extractField(responseText, 'Origin'),
      roastLevel: extractField(responseText, 'Roast level'),
      flavorNotes: extractField(responseText, 'Flavor notes'),
      processingMethod: extractField(responseText, 'Processing method'),
      certifications: extractField(responseText, 'certifications'),
      rawResponse: responseText
    };
  } catch (error) {
    console.error('Error analyzing coffee bean image:', error);
    throw error;
  }
};

/**
 * Helper function to extract fields from text response
 */
const extractField = (text, fieldName) => {
  const regex = new RegExp(`${fieldName}[:\\s]+(.*?)(?=\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

/**
 * Get similar coffee bean recommendations based on a bean
 * @param {Object} beanInfo - Information about the coffee bean
 * @returns {Promise<Array>} - List of similar coffee beans
 */
export const getSimilarBeans = async (beanInfo) => {
  try {
    const prompt = `
      Based on this coffee bean:
      Name: ${beanInfo.beanName}
      Roaster: ${beanInfo.roaster}
      Origin: ${beanInfo.origin}
      Roast Level: ${beanInfo.roastLevel}
      Flavor Notes: ${beanInfo.flavorNotes}
      
      Recommend 3 similar coffee beans that a coffee enthusiast might enjoy.
      For each recommendation, provide:
      1. Bean Name
      2. Roaster
      3. Origin
      4. Roast Level
      5. Flavor Notes
      6. Why it's similar
      
      Format as a JSON array of objects.
    `;

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const responseText = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\\[.*\\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to mock data if parsing fails
    return [
      {
        beanName: "Similar Bean 1",
        roaster: "Example Roaster 1",
        origin: beanInfo.origin,
        roastLevel: beanInfo.roastLevel,
        flavorNotes: "Similar to original with slight variations",
        whySimilar: "Similar origin and roast profile"
      },
      {
        beanName: "Similar Bean 2",
        roaster: "Example Roaster 2",
        origin: "Related region",
        roastLevel: beanInfo.roastLevel,
        flavorNotes: "Complementary flavor profile",
        whySimilar: "Similar flavor notes but from a different region"
      },
      {
        beanName: "Similar Bean 3",
        roaster: "Example Roaster 3",
        origin: "Another region",
        roastLevel: beanInfo.roastLevel,
        flavorNotes: "Different but appealing to same palate",
        whySimilar: "Different origin but similar overall profile"
      }
    ];
  } catch (error) {
    console.error('Error getting similar beans:', error);
    throw error;
  }
};

export default {
  analyzeCoffeeBeanImage,
  getSimilarBeans
};
