exports.handler = async function(event, context) {
  const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY;
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8mPlEiXfPQFG5ZiNBUgk-VIbLXjZqreRiYEdB5VXzZR9Y07Mo_AdzFVnKTyB91OAxrg/exec';

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const userEmail = payload.mail;

    if (!userEmail) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email is a required field.' }) };
    }

    const validationUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${userEmail}`;
    
    const validationResponse = await fetch(validationUrl);
    const validationData = await validationResponse.json();

    // --- THIS IS THE NEW LINE FOR DEBUGGING ---
    console.log('Abstract API Full Response:', JSON.stringify(validationData, null, 2));
    // --- END OF NEW LINE ---

    if (validationData.deliverability !== 'DELIVERABLE') {
      console.log('Blocked invalid email:', userEmail);
      return { 
        statusCode: 400,
        body: JSON.stringify({ message: 'Email address appears to be invalid or undeliverable.' }) 
      };
    }

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
