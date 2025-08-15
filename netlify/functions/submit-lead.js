exports.handler = async function(event, context) {
  const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY;
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8mPlEiXfPQFG5ZiNBUgk-VIbLXjZqreRiYEdB5VXzZR9Y07Mo_AdzFVnKTyB91OAxrg/exec';
  const WORD_LIMIT = 800;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const userEmail = payload.mail;
    const reasonText = payload.reason || '';

    // --- Server-side word count validation ---
    const wordCount = reasonText.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > WORD_LIMIT) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ message: `Reason for contact exceeds the ${WORD_LIMIT}-word limit.` }) 
      };
    }

    if (!userEmail) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email is a required field.' }) };
    }

    // --- CHANGE #1: Use the correct "Email Validation" API endpoint ---
    const validationUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${userEmail}`;
    
    const validationResponse = await fetch(validationUrl);
    const validationData = await validationResponse.json();

    // --- CHANGE #2: Check the 'deliverability' field from the Validation API ---
    if (validationData.deliverability !== 'DELIVERABLE') {
      console.log('Blocked undeliverable email:', userEmail);
      return { 
        statusCode: 400,
        body: JSON.stringify({ message: 'Email address appears to be invalid or undeliverable.' }) 
      };
    }

    // --- CHANGE #3: Add the validation details to the payload ---
    payload.mailValidation = {
        deliverability: validationData.deliverability,
        qualityScore: validationData.quality_score
    };

    // If validation passes, we send the enriched payload to Google Script.
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!googleResponse.ok) {
        return { statusCode: googleResponse.status, body: googleResponse.statusText };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Lead submitted successfully' }),
    };

  } catch (error) {
    return { statusCode: 500, body: `Server error: ${error.message}` };
  }
};
