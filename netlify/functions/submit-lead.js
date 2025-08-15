// This is the updated server-side proxy function with email validation.
exports.handler = async function(event, context) {
  // Get our secret API key from the environment variables.
  const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY;
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8mPlEiXfPQFG5ZiNBUgk-VIbLXjZqreRiYEdB5VXzZR9Y07Mo_AdzFVnKTyB91OAxrg/exec';

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const userEmail = payload.mail;

    // --- START OF NEW VALIDATION LOGIC ---
    if (!userEmail) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email is a required field.' }) };
    }

    const validationUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${userEmail}`;
    
    const validationResponse = await fetch(validationUrl);
    const validationData = await validationResponse.json();

    // We check the 'DELIVERABILITY' status from the API.
    // If it's not DELIVERABLE, we reject the request.
    if (validationData.deliverability !== 'DELIVERABLE') {
      console.log('Blocked invalid email:', userEmail, 'Reason:', validationData.quality_score);
      return { 
        statusCode: 400, // 400 means "Bad Request"
        body: JSON.stringify({ message: 'Email address appears to be invalid or undeliverable.' }) 
      };
    }
    // --- END OF NEW VALIDATION LOGIC ---


    // If validation passes, we proceed to send the data to Google Script.
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
