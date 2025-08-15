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

    // --- FIX #1: Use the correct "Email Reputation" API endpoint ---
    const reputationUrl = `https://emailreputation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${userEmail}`;
    
    const reputationResponse = await fetch(reputationUrl);
    const reputationData = await reputationResponse.json();

    // --- FIX #2: Check the 'spam' field from the Reputation API's response ---
    // If the API flags the email as spam, we reject the request.
    if (reputationData.spam === true) {
      console.log('Blocked spam email:', userEmail);
      return { 
        statusCode: 400,
        body: JSON.stringify({ message: 'This email address was flagged as suspicious.' }) 
      };
    }

    // If validation passes, we send the data to Google Script.
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
